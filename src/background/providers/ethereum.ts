import { ethers } from 'ethers';
import { Provider, TransactionParams, TokenInfo } from './provider';
import { Network, Account } from '../services/wallet';
import { WalletService } from '../services/wallet';

const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transfer(address to, uint256 amount) returns (bool)'
];

export class EthereumProvider extends Provider {
    private walletService: WalletService;

    constructor(network: Network, walletService: WalletService) {
        super(network);
        this.walletService = walletService;
    }

    async getAccounts(): Promise<Account[]> {
        const state = await this.walletService.getWalletStatus();
        return state.accounts[this.network.chainId] || [];
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.provider.getBalance(address);
        return ethers.utils.formatEther(balance);
    }

    async sendTransaction(params: TransactionParams): Promise<string> {
        const state = await this.walletService.getWalletStatus();
        const account = state.accounts[this.network.chainId]
            .find(acc => acc.address.toLowerCase() === params.to.toLowerCase());

        if (!account) {
            throw new Error('Account not found');
        }

        const privateKey = await this.walletService.getPrivateKey(account.address, '');
        const signer = await this.getSigner(account.address, privateKey);

        const tx = await signer.sendTransaction({
            to: params.to,
            value: ethers.utils.parseEther(params.value),
            data: params.data,
            gasLimit: params.gasLimit ? ethers.BigNumber.from(params.gasLimit) : undefined,
            gasPrice: params.gasPrice ? ethers.BigNumber.from(params.gasPrice) : undefined,
            maxFeePerGas: params.maxFeePerGas ? ethers.BigNumber.from(params.maxFeePerGas) : undefined,
            maxPriorityFeePerGas: params.maxPriorityFeePerGas ? ethers.BigNumber.from(params.maxPriorityFeePerGas) : undefined,
            nonce: params.nonce
        });

        return tx.hash;
    }

    async signMessage(address: string, message: string): Promise<string> {
        const state = await this.walletService.getWalletStatus();
        const account = state.accounts[this.network.chainId]
            .find(acc => acc.address.toLowerCase() === address.toLowerCase());

        if (!account) {
            throw new Error('Account not found');
        }

        const privateKey = await this.walletService.getPrivateKey(account.address, '');
        const signer = await this.getSigner(account.address, privateKey);

        return await signer.signMessage(message);
    }

    async getTransactionHistory(address: string): Promise<any[]> {
        const blockNumber = await this.provider.getBlockNumber();
        const history = [];

        // Get last 100 blocks
        for (let i = blockNumber - 100; i <= blockNumber; i++) {
            const block = await this.provider.getBlockWithTransactions(i);
            const transactions = block.transactions.filter(tx =>
                tx.from.toLowerCase() === address.toLowerCase() ||
                tx.to?.toLowerCase() === address.toLowerCase()
            );

            for (const tx of transactions) {
                history.push({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.utils.formatEther(tx.value),
                    timestamp: block.timestamp,
                    blockNumber: i
                });
            }
        }

        return history;
    }

    async getTokenBalance(address: string, tokenAddress: string): Promise<string> {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        return ethers.utils.formatUnits(balance, decimals);
    }

    async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const [symbol, name, decimals] = await Promise.all([
            contract.symbol(),
            contract.name(),
            contract.decimals()
        ]);

        return {
            address: tokenAddress,
            symbol,
            name,
            decimals
        };
    }

    async approveToken(tokenAddress: string, spender: string, amount: string): Promise<string> {
        const state = await this.walletService.getWalletStatus();
        const account = state.accounts[this.network.chainId][0]; // Use first account for token operations

        const privateKey = await this.walletService.getPrivateKey(account.address, '');
        const signer = await this.getSigner(account.address, privateKey);
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const decimals = await contract.decimals();
        const amountWei = ethers.utils.parseUnits(amount, decimals);

        const tx = await contract.approve(spender, amountWei);
        return tx.hash;
    }

    async transferToken(tokenAddress: string, to: string, amount: string): Promise<string> {
        const state = await this.walletService.getWalletStatus();
        const account = state.accounts[this.network.chainId][0]; // Use first account for token operations

        const privateKey = await this.walletService.getPrivateKey(account.address, '');
        const signer = await this.getSigner(account.address, privateKey);
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const decimals = await contract.decimals();
        const amountWei = ethers.utils.parseUnits(amount, decimals);

        const tx = await contract.transfer(to, amountWei);
        return tx.hash;
    }
} 