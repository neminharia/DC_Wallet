export interface NetworkConfig {
  chainId: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  decimals: number;
  blockExplorer: string;
  icon?: string;
}

export const NETWORKS: { [key: string]: NetworkConfig } = {
  ethereum: {
    chainId: '1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    symbol: 'ETH',
    decimals: 18,
    blockExplorer: 'https://etherscan.io',
    icon: 'ethereum.svg'
  },
  goerli: {
    chainId: '5',
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR-PROJECT-ID',
    symbol: 'ETH',
    decimals: 18,
    blockExplorer: 'https://goerli.etherscan.io',
    icon: 'ethereum.svg'
  },
  solana: {
    chainId: '101',
    name: 'Solana Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    symbol: 'SOL',
    decimals: 9,
    blockExplorer: 'https://explorer.solana.com',
    icon: 'solana.svg'
  },
  solanaDevnet: {
    chainId: '103',
    name: 'Solana Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    symbol: 'SOL',
    decimals: 9,
    blockExplorer: 'https://explorer.solana.com/?cluster=devnet',
    icon: 'solana.svg'
  }
};

export const TESTNET_NETWORKS: { [key: string]: NetworkConfig } = {
  ganache: NETWORKS.ganache
};
