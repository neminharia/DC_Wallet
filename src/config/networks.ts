export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  currency: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export const NETWORKS: { [key: string]: NetworkConfig } = {
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    isTestnet: false,
  },
  ganache: {
    chainId: 1337,
    name: "Ganache Local",
    rpcUrl: "http://127.0.0.1:7545",
    currency: "ETH",
    explorerUrl: "",
    isTestnet: true,
  }
};

export const TESTNET_NETWORKS: { [key: string]: NetworkConfig } = {
  ganache: NETWORKS.ganache
};
