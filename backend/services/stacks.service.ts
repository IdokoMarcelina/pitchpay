import { STACKS_TESTNET } from '@stacks/network';
import {
    fetchCallReadOnlyFunction,
    bufferCV,
    principalCV,
    uintCV,
    cvToJSON,
} from '@stacks/transactions';
import * as crypto from 'crypto';
import AuthSession from '../models/AuthSession';
import logger from '../middleware/logger';

// Cross-environment fetch support
const _fetch = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

const network = STACKS_TESTNET;

const CONTRACT_ADDRESS =
    (process.env.CONTRACT_ADDRESS ||
        'ST1Z0AQZHXW508XB03EWKH6KK90A0T084DTD8DPTG').trim();

const CONTRACT_NAME = (process.env.CONTRACT_NAME || 'pitchpay_clar_v1').trim();

const STACKS_API_URL =
    (process.env.STACKS_API_URL || 'https://api.testnet.hiro.so').trim();

const SBTC_CONTRACT = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token';

logger.info('Stacks Service Configuration Initialized', {
    CONTRACT_ADDRESS,
    CONTRACT_NAME,
    STACKS_API_URL,
    RAW_ENV: process.env.CONTRACT_ADDRESS
});

logger.info('Stacks Configuration:', {
    CONTRACT_ADDRESS,
    CONTRACT_NAME,
    STACKS_API_URL,
    env_contract: process.env.CONTRACT_ADDRESS
});

export const getContractId = () => `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

const NONCE_EXPIRY_MINUTES = 5;

const flattenCV = (cvJson: any): any => {
    if (!cvJson) return null;

    // Handle null values and 'none' results
    if (cvJson.value === null || cvJson.type === 'none' || (cvJson.type && (cvJson.type === 'none' || cvJson.type.includes('none')))) {
        return null;
    }

    const type = cvJson.type || '';

    // If it's a wrapper (response, optional, some, etc.), recurse into .value
    // A wrapper CV JSON has a .value which is itself a CV JSON object (has a .type)
    if (cvJson.value && typeof cvJson.value === 'object' && (cvJson.value.type || cvJson.value.value !== undefined)) {
        // Handle cases where .value is the unwrapped content or another CV object
        if (cvJson.value.type) {
            return flattenCV(cvJson.value);
        }
        // If it's a primitive value inside the wrapper but type info is on parent
        // continue to normal processing
    }

    // Handle tuples: they have keys and nested CV JSON objects
    if (type.startsWith('(tuple') || type === 'tuple' || (cvJson.value && !cvJson.value.type && typeof cvJson.value === 'object')) {
        const result: any = {};
        const entries = cvJson.value && typeof cvJson.value === 'object' ? Object.entries(cvJson.value) : [];
        if (entries.length > 0) {
            for (const [key, val] of entries) {
                result[key] = flattenCV(val);
            }
            return result;
        }
    }

    // Handle primitives
    if (type === 'uint' || type === 'int' || type.includes('uint') || type.includes('int')) return parseInt(cvJson.value);
    if (type === 'bool' || type.includes('bool')) return cvJson.value === true || cvJson.value === 'true';
    if (type === 'principal' || type === 'buff' || type.includes('principal') || type.includes('buff')) return cvJson.value;

    return cvJson.value !== undefined ? cvJson.value : cvJson;
};

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
            logger.info('Calling read-only get-pitch', { pitchIdHash });
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-pitch',
                functionArgs: [bufferCV(Buffer.from(pitchIdHash, 'hex'))],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const json = cvToJSON(result);
            logger.debug('Read-only get-pitch result', { json });

            // Unpack from response/optional
            const flattened = flattenCV(json);
            if (!flattened) {
                logger.warn('Pitch not found on-chain (result flattened to null)', { pitchIdHash });
                return null;
            }
            return flattened;
        } catch (error) {
            logger.error('Error calling read-only get-pitch:', error);
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
    static async getRewardBalance(address: string): Promise<number | null> {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-reward-balance',
                functionArgs: [principalCV(address)],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const parsed = cvToJSON(result);
            return parsed.value?.value?.value ?? 0;
        } catch (error) {
            console.error('Error fetching reward balance:', error);
            return null;
        }
    }

    static async getUserReceipts(address: string) {
        try {
            const contractId = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
            const response = await _fetch(`${STACKS_API_URL}/extended/v1/address/${address}/nft_events?limit=50`);
            const data = await response.json() as any;

            if (!data.nft_events) return [];

            // Filter for investment-receipt mint events from our contract
            const events = data.nft_events.filter((e: any) =>
                e.asset_identifier === `${contractId}::investment-receipt` &&
                e.recipient.toLowerCase() === address.toLowerCase()
            );

            const receipts = await Promise.all(events.map(async (e: any) => {
                const receiptId = parseInt(e.value.value);
                const metadata = await this.getReceiptMetadata(receiptId);
                return {
                    receiptId,
                    txid: e.tx_id,
                    ...(typeof metadata === 'object' ? metadata : { rawMetadata: metadata })
                };
            }));

            return receipts;
        } catch (error) {
            logger.error('Error fetching user receipts:', error);
            return [];
        }
    }

    static async getReceiptMetadata(receiptId: number) {
        try {
            const result = await fetchCallReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-receipt-metadata',
                functionArgs: [uintCV(receiptId)],
                network,
                senderAddress: CONTRACT_ADDRESS,
            });
            const json = cvToJSON(result);
            if (!json.value) return null;
            return flattenCV(json.value);
        } catch (error) {
            console.error('Error fetching receipt metadata:', error);
            return null;
        }
    }
}