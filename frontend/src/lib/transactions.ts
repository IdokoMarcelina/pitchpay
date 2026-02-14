import { openContractCall } from '@stacks/connect';
import {
  bufferCV,
  uintCV,
} from '@stacks/transactions';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1Z0AQZHXW508XB03EWKH6KK90A0T084DTD8DPTG';
const CONTRACT_NAME = 'pitchpay_clar';

export interface TransactionResult {
  txid: string;
  success: boolean;
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function makeContractCall(
  functionName: string,
  functionArgs: any[]
): Promise<TransactionResult> {
  return new Promise((resolve, reject) => {
    openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName,
      functionArgs,
      network: 'testnet',
      onFinish: (data) => {
        resolve({
          txid: data.txId,
          success: true,
        });
      },
      onCancel: () => {
        reject(new Error('User cancelled transaction'));
      },
    });
  });
}

export async function payForPitch(pitchIdHash: string): Promise<TransactionResult> {
  return makeContractCall('pay-for-pitch', [bufferCV(hexToBytes(pitchIdHash))]);
}

export async function payForBoost(pitchIdHash: string): Promise<TransactionResult> {
  return makeContractCall('pay-for-boost', [bufferCV(hexToBytes(pitchIdHash))]);
}

export async function payForInvestment(pitchIdHash: string, amount: string): Promise<TransactionResult> {
  return makeContractCall('invest-in-pitch', [
    bufferCV(hexToBytes(pitchIdHash)),
    uintCV(amount)
  ]);
}

export function getContractId(): string {
  return `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
}

export function getContractAddress(): string {
  return CONTRACT_ADDRESS;
}
