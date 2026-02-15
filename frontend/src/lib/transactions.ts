import { openContractCall } from '@stacks/connect';
import {
  PostConditionMode,
  Pc,
  bufferCV,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1Z0AQZHXW508XB03EWKH6KK90A0T084DTD8DPTG';
const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME || 'pitchpay_clar_v1';
const SBTC_CONTRACT = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token';

export interface TransactionResult {
  txid: string;
  success: boolean;
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return Buffer.from(cleanHex, 'hex');
}

export async function makeContractCall(
  functionName: string,
  functionArgs: any[],
  postConditions: any[] = []
): Promise<TransactionResult> {
  console.log('makeContractCall called for:', functionName, { functionArgs, postConditions });
  return new Promise((resolve, reject) => {
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        postConditions,
        postConditionMode: PostConditionMode.Deny,
        network: STACKS_TESTNET,
        onFinish: (data) => {
          console.log('Contract call finished:', data);
          resolve({
            txid: data.txId,
            success: true,
          });
        },
        onCancel: () => {
          console.log('Contract call cancelled by user');
          reject(new Error('User cancelled transaction'));
        },
      });
    } catch (err) {
      console.error('Error during openContractCall initiation:', err);
      reject(err);
    }
  });
}

export async function payForPitch(pitchIdHash: string, userAddress: string, amount: number): Promise<TransactionResult> {
  const postConditions = [
    Pc.principal(userAddress).willSendEq(amount).ustx()
  ];
  return makeContractCall('pay-for-pitch', [bufferCV(hexToBytes(pitchIdHash))], postConditions);
}

export async function payForPitchFT(pitchIdHash: string, userAddress: string, amount: number): Promise<TransactionResult> {
  const postConditions = [
    Pc.principal(userAddress).willSendEq(amount).ft(SBTC_CONTRACT, 'sbtc-token')
  ];
  return makeContractCall('pay-for-pitch-ft', [
    bufferCV(hexToBytes(pitchIdHash)),
    principalCV(SBTC_CONTRACT)
  ], postConditions);
}

export async function payForBoost(pitchIdHash: string, userAddress: string, amount: number): Promise<TransactionResult> {
  const postConditions = [
    Pc.principal(userAddress).willSendEq(amount).ustx()
  ];
  return makeContractCall('pay-for-boost', [bufferCV(hexToBytes(pitchIdHash))], postConditions);
}

export async function payForInvestment(pitchIdHash: string, amount: string, userAddress: string): Promise<TransactionResult> {
  console.log('Preparing investment transaction:', { pitchIdHash, amount, userAddress });
  const amountInt = BigInt(amount);
  const postConditions = [
    Pc.principal(userAddress).willSendEq(amountInt).ustx()
  ];

  console.log('Contract Args:', [
    `Buffer: ${pitchIdHash}`,
    `Uint: ${amountInt.toString()}`
  ]);

  return makeContractCall('invest-in-pitch', [
    bufferCV(hexToBytes(pitchIdHash)),
    uintCV(amountInt)
  ], postConditions);
}

export async function payForInvestmentFT(pitchIdHash: string, amount: string, userAddress: string): Promise<TransactionResult> {
  const amountInt = BigInt(amount);
  const postConditions = [
    Pc.principal(userAddress).willSendEq(amountInt).ft(SBTC_CONTRACT, 'sbtc-token')
  ];

  return makeContractCall('invest-in-pitch-ft', [
    bufferCV(hexToBytes(pitchIdHash)),
    uintCV(amountInt),
    principalCV(SBTC_CONTRACT)
  ], postConditions);
}

export function getContractId(): string {
  return `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
}

export function getContractAddress(): string {
  return CONTRACT_ADDRESS;
}
