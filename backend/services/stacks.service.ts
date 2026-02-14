import { STACKS_TESTNET } from '@stacks/network';
import {
    fetchCallReadOnlyFunction,
    bufferCV,
    cvToJSON,
} from '@stacks/transactions';
import * as crypto from 'crypto';
import AuthSession from '../models/AuthSession';
import logger from '../middleware/logger';

const network = STACKS_TESTNET;

const CONTRACT_ADDRESS =
    process.env.CONTRACT_ADDRESS ||
    'ST1Z0AQZHXW508XB03EWKH6KK90A0T084DTD8DPTG';

const CONTRACT_NAME = 'pitchpay_clar';

const STACKS_API_URL =
    process.env.STACKS_API_URL || 'https://api.testnet.hiro.so';

export const getContractId = () => `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

const NONCE_EXPIRY_MINUTES = 5;

export class StacksService {
    static generatePitchHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    static async generateAuthNonce(address: string): Promise<string> {
        const nonce = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000);

        await AuthSession.create({
            address: address.toLowerCase(),
            nonce,
            expiresAt,
        });

        return nonce;
    }

    static async verifyAuthNonce(nonce: string, address: string): Promise<boolean> {
        const session = await AuthSession.findOne({
            nonce,
            address: address.toLowerCase(),
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return false;
        }

        await AuthSession.deleteOne({ _id: session._id });
        return true;
    }

    static async cleanupExpiredNonces(): Promise<void> {
        await AuthSession.deleteMany({ expiresAt: { $lte: new Date() } });
    }

    static async getContractOwner(): Promise<string | null> {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-contract-owner',
                functionArgs: [],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const parsed = cvToJSON(result);
            return parsed.value ?? null;
        } catch (error) {
            console.error('Error fetching contract owner:', error);
            return null;
        }
    }

    static async getPitchOnChain(pitchIdHash: string) {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-pitch',
                functionArgs: [bufferCV(Buffer.from(pitchIdHash, 'hex'))],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });

            return cvToJSON(result).value;
        } catch (error) {
            console.error('Error calling read-only function:', error);
            return null;
        }
    }

    static async verifyTransaction(txid: string) {
        try {
            const response = await fetch(
                `${STACKS_API_URL}/extended/v1/tx/${txid}`
            );

            if (!response.ok) return null;

            const tx: any = await response.json();
            logger.info(`Hiro API response for ${txid}`, { tx });
            return tx;
        } catch (error) {
            logger.error('Error verifying transaction', { error: String(error), txid });
            return null;
        }
    }

    static async getPitchFee(): Promise<number | null> {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-pitch-fee',
                functionArgs: [],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const parsed = cvToJSON(result);
            return parsed.value?.value ?? null;
        } catch (error) {
            console.error('Error fetching pitch fee:', error);
            return null;
        }
    }

    static async getBoostFee(): Promise<number | null> {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-boost-fee',
                functionArgs: [],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const parsed = cvToJSON(result);
            return parsed.value?.value ?? null;
        } catch (error) {
            console.error('Error fetching boost fee:', error);
            return null;
        }
    }
}