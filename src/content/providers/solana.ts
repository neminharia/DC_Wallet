export class SolanaProvider {
  private static instance: SolanaProvider;

  private constructor() {}

  static getInstance(): SolanaProvider {
    if (!SolanaProvider.instance) {
      SolanaProvider.instance = new SolanaProvider();
    }
    return SolanaProvider.instance;
  }

  async connect(): Promise<{ publicKey: string }> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "SOL_CONNECT",
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve({ publicKey: response.result.publicKey });
          }
        }
      );
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "SOL_DISCONNECT",
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async signTransaction(transaction: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "SOL_SIGN_TRANSACTION",
          transaction,
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        }
      );
    });
  }

  async signAllTransactions(transactions: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "SOL_SIGN_ALL_TRANSACTIONS",
          transactions,
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        }
      );
    });
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "SOL_SIGN_MESSAGE",
          message: Array.from(message),
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve({
              signature: new Uint8Array(response.result.signature),
            });
          }
        }
      );
    });
  }

  on(event: string, handler: (...args: any[]) => void): void {
    // TODO: Implement event handling
  }

  removeListener(event: string, handler: (...args: any[]) => void): void {
    // TODO: Implement event removal
  }
}
