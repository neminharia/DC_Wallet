import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import NetworkSelector from './NetworkSelector';
import { WalletAccount, Transaction } from '../services/wallet/types';
import { NETWORKS } from '../config/networks';
import { formatAddress } from '../utils/format';

interface DashboardProps {
    selectedNetwork: string;
    accounts: WalletAccount[];
    onNetworkChange: (network: string) => void;
    onLockWallet: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    selectedNetwork,
    accounts,
    onNetworkChange,
    onLockWallet,
}) => {
    const [balance, setBalance] = useState<string>('0');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const currentNetwork = NETWORKS[selectedNetwork];
    const currentAccount = accounts[0]; // Using first account for simplicity

    useEffect(() => {
        if (currentAccount) {
            fetchBalanceAndTransactions();
        }
    }, [selectedNetwork, currentAccount]);

    const fetchBalanceAndTransactions = async () => {
        try {
            // These would be actual calls to your wallet service
            // const balance = await walletService.getBalance(currentAccount.address);
            // const txHistory = await walletService.getTransactionHistory(currentAccount.address);
            // setBalance(balance.amount);
            // setTransactions(txHistory);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
    };

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <NetworkSelector
                        selectedNetwork={selectedNetwork}
                        onNetworkChange={onNetworkChange}
                    />
                    <Typography variant="h6" gutterBottom>
                        {currentNetwork.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Chain ID: {currentNetwork.chainId}
                    </Typography>
                </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Account Details
                    </Typography>
                    <Typography variant="body1">
                        Address: {formatAddress(currentAccount?.address)}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 2 }}>
                        {balance} {currentNetwork.symbol}
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Recent Transactions
                    </Typography>
                    <List>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <React.Fragment key={tx.hash}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`${formatAddress(tx.from)} → ${formatAddress(tx.to)}`}
                                            secondary={`${tx.value} ${currentNetwork.symbol} • ${tx.status}`}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="No transactions yet" />
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onLockWallet}
                >
                    Lock Wallet
                </Button>
            </Box>
        </Box>
    );
};

export default Dashboard; 