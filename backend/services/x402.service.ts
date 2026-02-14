import { Request, Response } from 'express';
import { StacksService, getContractId } from './stacks.service';
import Pitch from '../models/Pitch';
import logger from '../middleware/logger';
import { AIService } from './ai.service';

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

        if (!tx) return { success: false, error: 'Transaction not found or Hiro API error' };

        logger.info('Transaction status', { txid, status: tx.tx_status, type: tx.tx_type });

        if (tx.tx_status === 'success' || tx.tx_status === 'pending') {
            // Basic validation for pending tx
            if (tx.tx_status === 'pending') {
                const contractId = getContractId();
                if (tx.tx_type !== 'contract_call' ||
                    tx.contract_call.contract_id !== contractId ||
                    tx.contract_call.function_name !== 'pay-for-pitch') {
                    return { success: false, error: 'Invalid transaction type or target' };
                }
            }

            const pitch = await Pitch.findById(pitchId);
            if (!pitch) return { success: false, error: 'Pitch not found' };

            const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash) as any;

            if (onChainData && onChainData.founder.toLowerCase() === pitch.founder.toLowerCase()) {
                pitch.status = 'VERIFIED';
                // Trigger AI analysis for the verified pitch
                await AIService.processNewPitch(pitch);
            } else {
                // Either tx_status is 'success' (but not yet on-chain) or 'pending'
                // In both cases, we mark as PAID to acknowledge the transaction
                pitch.status = 'PAID';
            }

            pitch.txid = txid;
            await pitch.save();
            return { success: true, status: tx.tx_status, pitch };
        }

        return {
            success: false,
            status: tx.tx_status,
            error: tx.tx_status === 'abort_by_post_condition' ? 'Transaction aborted by post-condition' : `Transaction failed: ${tx.tx_status}`
        };
    }

    static async verifyBoostPayment(pitchId: string, txid: string) {
        logger.info('Verifying boost payment', { pitchId, txid });
        const tx = (await StacksService.verifyTransaction(txid)) as any;

        if (!tx) return { success: false, error: 'Transaction not found or Hiro API error' };

        logger.info('Boost transaction status', { txid, status: tx.tx_status, type: tx.tx_type });

        if (tx.tx_status === 'success' || tx.tx_status === 'pending') {
            // Basic validation for pending tx
            if (tx.tx_status === 'pending') {
                const contractId = getContractId();
                if (tx.tx_type !== 'contract_call' ||
                    tx.contract_call.contract_id !== contractId ||
                    tx.contract_call.function_name !== 'pay-for-boost') {
                    return { success: false, error: 'Invalid boost transaction' };
                }
            }

            const pitch = await Pitch.findById(pitchId);

            if (pitch) {
                const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);

                if (onChainData && onChainData['is-boosted']) {
                    pitch.isBoosted = true;
                }

                // Always save txid for boost as well if we don't have it or if it's new
                // For simplified tracking
                pitch.txid = txid;
                await pitch.save();
                return { success: true, status: tx.tx_status, pitch };
            }
            return { success: false, error: 'Pitch not found' };
        }

        return {
            success: false,
            status: tx.tx_status,
            error: tx.tx_status === 'abort_by_post_condition' ? 'Boost transaction aborted (possibly pitch not on-chain)' : `Boost transaction failed: ${tx.tx_status}`
        };
    }

    static async getPitchPaymentDetails(pitchId: string, pitchIdHash: string) {
        const { pitchFee } = await getCachedFees();

        return {
            status: 402,
            message: 'Payment Required: Send 5 STX to publish your pitch',
            payment_details: {
                type: 'stacks',
                amount: pitchFee,
                contract_call: {
                    contract: getContractId(),
                    function: 'pay-for-pitch',
                    args: [`0x${pitchIdHash}`],
                },
                internal_id: pitchId,
            },
        };
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
                } else if (tx && tx.tx_status === 'pending') {
                    return { synced: false, reason: 'transaction_pending' };
                } else if (tx && tx.tx_status === 'success') {
                    return { synced: false, reason: 'indexer_lagging' };
                } else if (!tx) {
                    // Hiro 404 could mean many things, but if it's been PAID for a while and not on-chain, it's safer to allow re-sync
                    logger.warn('Transaction not found on-chain, and not in Hiro index. Resetting to PENDING for recovery.', { pitchId, txid: pitch.txid });
                    pitch.status = 'PENDING';
                    pitch.txid = undefined;
                    await pitch.save();
                    return { synced: true, updated: true, newStatus: 'PENDING', reason: 'transaction_missing' };
                }
            } else if (pitch.status === 'PAID') {
                // Marked as PAID but no TXID? Definitely inconsistent.
                pitch.status = 'PENDING';
                await pitch.save();
                return { synced: true, updated: true, newStatus: 'PENDING', reason: 'inconsistent_state' };
            }
            return { synced: false, reason: 'not_on_chain' };
        }

        let updated = false;

        if (onChainData.founder.toLowerCase() !== pitch.founder.toLowerCase()) {
            return { synced: false, reason: 'founder_mismatch' };
        }

        if (onChainData['is-boosted'] && !pitch.isBoosted) {
            pitch.isBoosted = true;
            updated = true;
        }

        if (pitch.status === 'PENDING' || pitch.status === 'PAID') {
            pitch.status = 'VERIFIED';
            updated = true;
            // Trigger AI analysis for the newly synced and verified pitch
            await AIService.processNewPitch(pitch);
        }

        if (updated) {
            await pitch.save();
        }

        return { synced: true, updated, onChainData };
    }

    static async getBoostPaymentDetails(pitchId: string, pitchIdHash: string) {
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
                internal_id: pitchId,
            },
        };
    }

    static async getInvestmentPaymentDetails(pitchId: string, pitchIdHash: string, amountMicroSTX: number | null) {
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
                internal_id: pitchId,
            },
        };
    }

    static async verifyInvestmentPayment(pitchId: string, txid: string, investor?: string, amount?: number) {
        logger.info('Verifying investment payment', { pitchId, txid, investor, amount });
        const tx = (await StacksService.verifyTransaction(txid)) as any;

        if (!tx) return { success: false, error: 'Transaction not found or Hiro API error' };

        logger.info('Investment transaction status', { txid, status: tx.tx_status, type: tx.tx_type });

        if (tx.tx_status === 'success' || tx.tx_status === 'pending') {
            if (investor && amount) {
                const pitch = await Pitch.findById(pitchId);
                if (pitch) {
                    // Check if this txid already added to avoid duplicates
                    const alreadyInvested = pitch.investments.some(inv => inv.txid === txid);

                    if (!alreadyInvested && tx.tx_status === 'success') {
                        // Only add to DB if transaction is SUCCESSFUL (confirmed on-chain)
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
                        return { success: true, status: tx.tx_status, message: 'Investment verified and recorded' };
                    } else if (!alreadyInvested && tx.tx_status === 'pending') {
                        return { success: true, status: tx.tx_status, message: 'Investment transaction pending' };
                    }
                }
            }
            return { success: true, status: tx.tx_status };
        }

        return {
            success: false,
            status: tx.tx_status,
            error: tx.tx_status === 'abort_by_post_condition' ? 'Investment transaction aborted' : `Investment transaction failed: ${tx.tx_status}`
        };
    }
}