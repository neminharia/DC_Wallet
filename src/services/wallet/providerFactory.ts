import { NetworkConfig } from '../../config/networks';
import { IWalletProvider } from './types';
import { EthereumProvider } from './providers/ethereum';
import { SolanaProvider } from './providers/solana';

export class WalletProviderFactory {
    static createProvider(network: NetworkConfig): IWalletProvider {
        if (network.chainId === '1' || network.chainId === '5') {
            return new EthereumProvider(network);
        } else if (network.chainId === '101' || network.chainId === '103') {
            return new SolanaProvider(network);
        }
        throw new Error(`Unsupported network: ${network.name}`);
    }
} 