import { WalletAccount } from "./crypto";

export interface StorageData {
  encryptedMnemonic: string;
  accounts: {
    ethereum: WalletAccount[];
    solana: WalletAccount[];
  };
  selectedNetwork: "ethereum" | "solana";
  isLocked: boolean;
}

export class StorageManager {
  private static STORAGE_KEY = "walletData";

  static async getData(): Promise<StorageData | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        resolve(result[this.STORAGE_KEY] || null);
      });
    });
  }

  static async setData(data: StorageData): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { [this.STORAGE_KEY]: data },
        () => resolve()
      );
    });
  }

  static async clearData(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.STORAGE_KEY], () => resolve());
    });
  }

  static async isInitialized(): Promise<boolean> {
    const data = await this.getData();
    return data !== null;
  }
}
