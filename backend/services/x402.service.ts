import { Request, Response } from 'express';
import { StacksService, getContractId } from './stacks.service';
import Pitch from '../models/Pitch';

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
        const tx = (await StacksService.verifyTransaction(txid)) as StacksTx | null;

        if (tx && typeof tx.tx_status === 'string' && tx.tx_status === 'success') {
            const pitch = await Pitch.findById(pitchId);

            if (pitch) {
                const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);
                
                if (onChainData && onChainData.founder === pitch.founder) {
                    pitch.status = 'VERIFIED';
                } else {
                    pitch.status = 'PAID';
                }
                pitch.txid = txid;
                await pitch.save();
                return pitch;
            }
        }

        return null;
    }

    static async verifyBoostPayment(pitchId: string, txid: string) {
        const tx = (await StacksService.verifyTransaction(txid)) as StacksTx | null;

        if (tx && typeof tx.tx_status === 'string' && tx.tx_status === 'success') {
            const pitch = await Pitch.findById(pitchId);

            if (pitch) {
                const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);
                
                if (onChainData && onChainData['is-boosted']) {
                    pitch.isBoosted = true;
                    await pitch.save();
                    return pitch;
                }
            }
        }

        return null;
    }

    static async syncWithOnChain(pitchId: string) {
        const pitch = await Pitch.findById(pitchId);
        if (!pitch) return null;

        const onChainData = await StacksService.getPitchOnChain(pitch.pitchIdHash);
        
        if (!onChainData) {
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

        if (pitch.status === 'PENDING') {
            pitch.status = 'VERIFIED';
            updated = true;
        }

        if (updated) {
            await pitch.save();
        }

        return { synced: true, onChainData };
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
        const tx = (await StacksService.verifyTransaction(txid)) as StacksTx | null;

        if (tx && typeof tx.tx_status === 'string' && tx.tx_status === 'success') {
            if (investor && amount) {
                const pitch = await Pitch.findById(pitchId);
                if (pitch) {
                    pitch.investments.push({
                        investor: investor.toLowerCase(),
                        amount,
                        txid,
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