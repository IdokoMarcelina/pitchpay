import { request } from '@stacks/connect';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'STMX4RANCST3JVGD5J0KEQ6D20ZCFWRF1EKXZ8ER';
const CONTRACT_NAME = 'pitchpay_clar';

export interface TransactionResult {
  txid: string;
  success: boolean;
}

export async function makeContractCall(
  functionName: string,
  functionArgs: string[]
): Promise<TransactionResult> {
  try {
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName,
      functionArgs,
      network: 'testnet',
    }) as { txid?: string; transaction?: string };

    if (response?.txid) {
      return {
        txid: response.txid,
        success: true,
      };
    }

    throw new Error('No transaction ID returned');
  } catch (error: unknown) {
    const err = error as { message?: string; code?: number };
    if (err.message?.includes('cancel') || err.code === 4001) {
      throw new Error('User cancelled transaction');
    }
    throw error;
  }
}

export async function payForPitch(pitchIdHash: string): Promise<TransactionResult> {
  return makeContractCall('pay-for-pitch', [`0x${pitchIdHash}`]);
}

export async function payForBoost(pitchIdHash: string): Promise<TransactionResult> {
  return makeContractCall('pay-for-boost', [`0x${pitchIdHash}`]);
}

export function getContractId(): string {
  return `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
}

export function getContractAddress(): string {
  return CONTRACT_ADDRESS;
}
