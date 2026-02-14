import { STACKS_TESTNET } from '@stacks/network';
import { fetchCallReadOnlyFunction, bufferCV, cvToJSON } from '@stacks/transactions';

async function checkOnChain() {
    const CONTRACT_ADDRESS = 'ST1Z0AQZHXW508XB03EWKH6KK90A0T084DTD8DPTG';
    const CONTRACT_NAME = 'pitchpay_clar';
    const pitchIdHash = '3f6127bce0d5c85573861e988fdbad2f408012a661adba0f16766dc51fdf0720';

    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-pitch',
            functionArgs: [bufferCV(Buffer.from(pitchIdHash, 'hex'))],
            network: STACKS_TESTNET,
            senderAddress: CONTRACT_ADDRESS,
        });

        console.log('On-chain result:', JSON.stringify(cvToJSON(result), null, 2));
    } catch (error) {
        console.error('Error fetching from blockchain:', error);
    }
}

checkOnChain();
