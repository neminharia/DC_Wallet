export abstract class BaseProvider {
  abstract getAccounts(): Promise<string[]>;
  abstract getBalance(address: string): Promise<string>;
  abstract sendTransaction(params: { from: string; to: string; value: string }): Promise<string>;
  abstract getGasPrice(): Promise<string>;
  abstract signMessage(address: string, message: string): Promise<string>;
}
