import { Account } from "../../background/services/wallet";

export interface WalletState {
  isInitialized: boolean;
  isLocked: boolean;
  address: string | null;
  accounts: {
    [network: string]: Account[];
  };
  selectedNetwork: string;
  balances?: {
    [address: string]: string;
  };
}

export const getWalletState = async (): Promise<WalletState> => {
  // First check local storage for initialization status
  const checkStorage = async () => {
    return new Promise<boolean>((resolve) => {
      chrome.storage.local.get(['isInitialized'], (result) => {
        resolve(!!result.isInitialized);
      });
    });
  };

  const isStorageInitialized = await checkStorage();

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "GET_WALLET_STATE" },
      (response) => {
        if (response?.success && response.result) {
          resolve(response.result);
        } else {
          // Only return uninitialized state if storage confirms it
          resolve({
            isInitialized: isStorageInitialized,
            isLocked: true,
            address: null,
            accounts: {
              ethereum: [],
              solana: [],
            },
            selectedNetwork: "ethereum",
            balances: {},
          });
        }
      }
    );
  });
};

export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (network: string, type: 'address' | 'transaction', hash: string): string => {
  switch (network) {
    case 'ethereum':
      return `https://etherscan.io/${type}/${hash}`;
    case 'solana':
      return `https://explorer.solana.com/${type}/${hash}`;
    default:
      return `http://localhost:7545`;
  }
};
