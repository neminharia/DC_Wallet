import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  ContentCopy,
  OpenInNew,
  MoreVert,
  SwapHoriz,
  Send,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { formatAddress } from '../utils/wallet';

interface DashboardProps {
  selectedNetwork: string;
  accounts: string[];
  onNetworkChange: (network: string) => void;
  onLockWallet: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedNetwork,
  accounts,
  onNetworkChange,
  onLockWallet,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0] || '');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      loadBalance();
    }
  }, [selectedAccount]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const response = await new Promise<{ success: boolean; result?: string; error?: string }>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_BALANCE',
          address: selectedAccount,
        }, resolve);
      });

      if (response.success && response.result) {
        setBalance(response.result);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOpenExplorer = () => {
    const explorerUrl = selectedNetwork === 'ethereum' 
      ? `https://etherscan.io/address/${selectedAccount}`
      : `http://localhost:7545`;
    window.open(explorerUrl, '_blank');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Account</Typography>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={onLockWallet}>Lock Wallet</MenuItem>
              <MenuItem onClick={() => onNetworkChange(selectedNetwork === 'ethereum' ? 'solana' : 'ethereum')}>
                Switch Network
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccountBalanceWallet />
            <Typography>{formatAddress(selectedAccount)}</Typography>
            <IconButton size="small" onClick={() => handleCopy(selectedAccount)}>
              <ContentCopy fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleOpenExplorer}>
              <OpenInNew fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4">{balance} ETH</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Send />}
              onClick={() => {/* TODO: Implement send */}}
            >
              Send
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SwapHoriz />}
              onClick={() => {/* TODO: Implement swap */}}
            >
              Swap
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Assets
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Ethereum"
                secondary={loading ? 'Loading...' : `${balance} ETH`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleCopy(balance.toString())}>
                  <ContentCopy />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            No recent transactions
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 