export interface WalletState {
  isInitialized: boolean;
  isLocked: boolean;
  selectedNetwork: string;
  accounts: {
    [network: string]: string[];
  };
  balances?: {
    [address: string]: string;
  };
}

export const getWalletState = async (): Promise<WalletState> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "GET_WALLET_STATE" },
      (response) => {
        if (response?.success && response.result) {
          resolve(response.result);
        } else {
          resolve({
            isInitialized: false,
            isLocked: true,
            selectedNetwork: "ethereum",
            accounts: {
              ethereum: [],
              solana: [],
            },
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
