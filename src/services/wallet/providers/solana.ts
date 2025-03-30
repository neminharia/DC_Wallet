import { Connection, PublicKey, Keypair, SystemProgram, Transaction as SolanaTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NetworkConfig } from '../../../config/networks';
import { IWalletProvider, WalletAccount, WalletBalance, Transaction } from '../types';

export class SolanaProvider implements IWalletProvider {
    private connection: Connection;

    constructor(public network: NetworkConfig) {
        this.connection = new Connection(network.rpcUrl);
    }

    async createAccount(): Promise<WalletAccount> {
        const keypair = Keypair.generate();
        return {
            address: keypair.publicKey.toString(),
            privateKey: Buffer.from(keypair.secretKey).toString('hex'),
            network: this.network.name
        };
    }

    async importAccount(privateKey: string): Promise<WalletAccount> {
        const secretKey = Buffer.from(privateKey, 'hex');
        const keypair = Keypair.fromSecretKey(secretKey);
        return {
            address: keypair.publicKey.toString(),
            privateKey: privateKey,
            network: this.network.name
        };
    }

    async getBalance(address: string): Promise<WalletBalance> {
        const publicKey = new PublicKey(address);
        const balance = await this.connection.getBalance(publicKey);
        return {
            amount: (balance / LAMPORTS_PER_SOL).toString(),
            symbol: this.network.symbol
        };
    }

    async sendTransaction(from: string, to: string, amount: string): Promise<string> {
        const fromKeypair = Keypair.fromSecretKey(Buffer.from(from, 'hex'));
        const toPublicKey = new PublicKey(to);
        const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);

        const transaction = new SolanaTransaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPublicKey,
                lamports
            })
        );

        const signature = await this.connection.sendTransaction(
            transaction,
            [fromKeypair]
        );

        return signature;
    }

    async getTransaction(hash: string): Promise<Transaction> {
        const tx = await this.connection.getTransaction(hash);
        if (!tx || !tx.meta) {
            throw new Error('Transaction not found');
        }

        return {
            hash,
            from: tx.transaction.message.accountKeys[0].toString(),
            to: tx.transaction.message.accountKeys[1].toString(),
            value: (tx.meta.postBalances[1] - tx.meta.preBalances[1] / LAMPORTS_PER_SOL).toString(),
            timestamp: tx.blockTime || 0,
            status: tx.meta.err ? 'failed' : 'confirmed',
            network: this.network.name
        };
    }

    async getTransactionHistory(address: string): Promise<Transaction[]> {
        const publicKey = new PublicKey(address);
        const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 10 });

        const transactions: Transaction[] = [];
        for (const sig of signatures) {
            try {
                const tx = await this.getTransaction(sig.signature);
                transactions.push(tx);
            } catch (error) {
                console.error(`Error fetching transaction ${sig.signature}:`, error);
            }
        }

        return transactions;
    }

    validateAddress(address: string): boolean {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }
} 