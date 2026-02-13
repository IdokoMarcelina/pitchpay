import { STACKS_TESTNET } from '@stacks/network';
import {
    fetchCallReadOnlyFunction,
    bufferCV,
    cvToJSON,
} from '@stacks/transactions';
import * as crypto from 'crypto';

const network = STACKS_TESTNET;

const CONTRACT_ADDRESS =
    process.env.CONTRACT_ADDRESS ||
    'STMX4RANCST3JVGD5J0KEQ6D20ZCFWRF1EKXZ8ER';

const CONTRACT_NAME = 'pitchpay_clar';

const STACKS_API_URL =
    process.env.STACKS_API_URL || 'https://api.testnet.hiro.so';

export const getContractId = () => `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

export class StacksService {
    static generatePitchHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
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

            const tx = await response.json();
            return tx;
        } catch (error) {
            console.error('Error verifying transaction:', error);
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