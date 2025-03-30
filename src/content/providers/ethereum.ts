export class EthereumProvider {
  private static instance: EthereumProvider;

  private constructor() {}

  static getInstance(): EthereumProvider {
    if (!EthereumProvider.instance) {
      EthereumProvider.instance = new EthereumProvider();
    }
    return EthereumProvider.instance;
  }

  async request(args: { method: string; params?: any[] }): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "ETH_REQUEST",
          method: args.method,
          params: args.params,
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

  on(event: string, handler: (...args: any[]) => void): void {
    // TODO: Implement event handling
  }

  removeListener(event: string, handler: (...args: any[]) => void): void {
    // TODO: Implement event removal
  }
}
