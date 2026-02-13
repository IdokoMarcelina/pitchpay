export class StacksMockWallet {
  address: string = 'ST1PQHQKV0RJ7X6RGHN5X29D50Z6MR8BWG32W8A7';
  private connected: boolean = false;

  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    return `mock_signature_${Date.now()}_${message.slice(0, 10)}`;
  }

  getAddress(): string {
    return this.address;
  }
}
