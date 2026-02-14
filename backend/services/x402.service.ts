import { Request, Response } from 'express';
import { StacksService, getContractId } from './stacks.service';
import Pitch from '../models/Pitch';
import logger from '../middleware/logger';

interface StacksTx {
    tx_status: string;
}

const DEFAULT_PITCH_FEE = 5000000;
const DEFAULT_BOOST_FEE = 10000000;

const cachedFees = {
    pitchFee: null as number | null,
    boostFee: null as number | null,
    timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000;

async function getCachedFees() {
    const now = Date.now();
    if (cachedFees.pitchFee && cachedFees.boostFee && (now - cachedFees.timestamp) < CACHE_TTL) {
        return { pitchFee: cachedFees.pitchFee, boostFee: cachedFees.boostFee };
    }

    const [pitchFee, boostFee] = await Promise.all([
        StacksService.getPitchFee(),
        StacksService.getBoostFee(),
    ]);

    cachedFees.pitchFee = pitchFee ?? DEFAULT_PITCH_FEE;
    cachedFees.boostFee = boostFee ?? DEFAULT_BOOST_FEE;
    cachedFees.timestamp = now;

    return { pitchFee: cachedFees.pitchFee, boostFee: cachedFees.boostFee };
}

export class X402Service {
    static async handlePitchPaymentRequired(
        req: Request,
        res: Response,
        pitchData: any
    ) {
        const pitchIdHash = StacksService.generatePitchHash(
            JSON.stringify({ ...pitchData, timestamp: Date.now() })
        );

        const pitch = new Pitch({
            ...pitchData,
            pitchIdHash,
            status: 'PENDING',
        });

        await pitch.save();

        const { pitchFee } = await getCachedFees();

        return res.status(402).json({
            status: 402,
            message: 'Payment Required: Send 5 STX to publish your pitch',
            payment_details: {
                type: 'stacks',
                amount: pitchFee,
                memo: `pitch:${pitchIdHash.substring(0, 10)}`,
                contract_call: {
                    contract: getContractId(),
                    function: 'pay-for-pitch',
                    args: [`0x${pitchIdHash}`],
                },
                internal_id: pitch._id,
            },
        });
    }

    static async verifyPayment(pitchId: string, txid: string) {
        logger.info('Verifying payment', { pitchId, txid });
        const tx = (await StacksService.verifyTransaction(txid)) as any;
        logger.info('Transaction status', { txid, status: tx?.tx_status, type: tx?.tx_type });

        if (tx && (tx.tx_status === 'success' || tx.tx_status === 'pending')) {
            // Basic validation for pending tx
            if (tx.tx_status === 'pending') {
                const contractId = getContractId();
                logger.info('Validating pending tx', { contractId });
                if (tx.tx_type !== 'contract_call' ||
                    tx.contract_call.contract_id !== contractId ||
                    tx.contract_call.function_name !== 'pay-for-pitch') {
                    logger.warn('Pending validation failed', {
                        type: tx.tx_type,
                        target_contract: tx.contract_call?.contract_id,
                        target_func: tx.contract_call?.function_name
                    });
                    return null;
                }
            }

            const pitch = await Pitch.findById(pitchId);
            if (!pitch) {
                logger.error('Pitch not found in database', { pitchId });
                return null;
            }

            const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);

            if (onChainData && onChainData.founder === pitch.founder) {
                pitch.status = 'VERIFIED';
            } else if (tx.tx_status === 'success') {
                // Transaction succeeded but record not yet on-chain (indexing lag)
                pitch.status = 'PAID';
            } else {
                // Transaction is pending, don't update status to PAID yet
                // But return the pitch so the frontend knows verification is in progress
                return pitch;
            }

            pitch.txid = txid;
            await pitch.save();
            return pitch;
        }

        return null;
    }

    static async verifyBoostPayment(pitchId: string, txid: string) {
        logger.info('Verifying boost payment', { pitchId, txid });
        const tx = (await StacksService.verifyTransaction(txid)) as any;
        logger.info('Boost transaction status', { txid, status: tx?.tx_status, type: tx?.tx_type });

        if (tx && (tx.tx_status === 'success' || tx.tx_status === 'pending')) {
            // Basic validation for pending tx
            if (tx.tx_status === 'pending') {
                const contractId = getContractId();
                if (tx.tx_type !== 'contract_call' ||
                    tx.contract_call.contract_id !== contractId ||
                    tx.contract_call.function_name !== 'pay-for-boost') {
                    logger.warn('Boost pending validation failed', {
                        type: tx.tx_type,
                        target_contract: tx.contract_call?.contract_id,
                        target_func: tx.contract_call?.function_name
                    });
                    return null;
                }
            }

            const pitch = await Pitch.findById(pitchId);

            if (pitch) {
                const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);

                if (onChainData && onChainData['is-boosted']) {
                    pitch.isBoosted = true;
                    await pitch.save();
                }
                // Return pitch even if indexing is not complete, as long as tx is pending/success
                return pitch;
            }
        }

        return null;
    }

    static async syncWithOnChain(pitchId: string) {
        const pitch = await Pitch.findById(pitchId);
        if (!pitch) return null;

        const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);

        if (!onChainData) {
            // If not on-chain, check if the transaction failed
            if (pitch.txid) {
                const tx = (await StacksService.verifyTransaction(pitch.txid)) as any;
                if (tx && (tx.tx_status === 'abort_by_post_condition' || tx.tx_status === 'abort_by_response' || tx.tx_status === 'failed')) {
                    logger.warn('Initial transaction failed, resetting pitch status', { pitchId, txid: pitch.txid, status: tx.tx_status });
                    pitch.status = 'PENDING';
                    pitch.txid = undefined;
                    await pitch.save();
                    return { synced: true, updated: true, newStatus: 'PENDING', reason: 'transaction_failed' };
                }
            }
            return { synced: false, reason: 'not_on_chain' };
        }

        let updated = false;

        if (onChainData.founder !== pitch.founder) {
            return { synced: false, reason: 'founder_mismatch' };
        }

        if (onChainData['is-boosted'] && !pitch.isBoosted) {
            pitch.isBoosted = true;
            updated = true;
        }

        if (pitch.status === 'PENDING' || pitch.status === 'PAID') {
            pitch.status = 'VERIFIED';
            updated = true;
        }

        if (updated) {
            await pitch.save();
        }

        return { synced: true, updated, onChainData };
    }

    static async getBoostPaymentDetails(pitchIdHash: string) {
        const { boostFee } = await getCachedFees();

        return {
            status: 402,
            message: 'Boost Payment Required: Send 10 STX to boost your pitch',
            payment_details: {
                type: 'stacks',
                amount: boostFee,
                contract_call: {
                    contract: getContractId(),
                    function: 'pay-for-boost',
                    args: [`0x${pitchIdHash}`],
                },
            },
        };
    }

    static async getInvestmentPaymentDetails(pitchIdHash: string, amountMicroSTX: number | null) {
        const { pitchFee } = await getCachedFees();
        const amount = amountMicroSTX || pitchFee;

        return {
            status: 402,
            message: `Investment Required: Send ${(amount / 1000000).toFixed(2)} STX to support this startup`,
            payment_details: {
                type: 'stacks',
                amount: amount,
                contract_call: {
                    contract: getContractId(),
                    function: 'invest-in-pitch',
                    args: [`0x${pitchIdHash}`, amount.toString()],
                },
            },
        };
    }

    static async verifyInvestmentPayment(pitchId: string, txid: string, investor?: string, amount?: number) {
        logger.info('Verifying investment payment', { pitchId, txid, investor, amount });
        const tx = (await StacksService.verifyTransaction(txid)) as any;
        logger.info('Investment transaction status', { txid, status: tx?.tx_status, type: tx?.tx_type });

        if (tx && (tx.tx_status === 'success' || tx.tx_status === 'pending')) {
            // Basic validation for pending tx
            if (tx.tx_status === 'pending') {
                const contractId = getContractId();
                if (tx.tx_type !== 'contract_call' ||
                    tx.contract_call.contract_id !== contractId ||
                    tx.contract_call.function_name !== 'invest-in-pitch') {
                    logger.warn('Investment pending validation failed', {
                        type: tx.tx_type,
                        target_contract: tx.contract_call?.contract_id,
                        target_func: tx.contract_call?.function_name
                    });
                    return null;
                }
            }

            if (investor && amount) {
                const pitch = await Pitch.findById(pitchId);
                if (pitch) {
                    pitch.investments.push({
                        investor: investor.toLowerCase(),
                        amount,
                        txid,
                        createdAt: new Date()
                    } as any);

                    pitch.notifications.push({
                        type: 'investment',
                        from: investor.toLowerCase(),
                        pitchId: pitch._id.toString(),
                        pitchTitle: pitch.title,
                        amount,
                        txid,
                        read: false,
                        createdAt: new Date()
                    } as any);

                    await pitch.save();
                }
            }
            return true;
        }

        return false;
    }
}