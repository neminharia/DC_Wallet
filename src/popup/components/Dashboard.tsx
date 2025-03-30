import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  AccountBalance,
  Send,
  SwapHoriz,
  Settings,
  Add,
  ContentCopy,
  Refresh,
  MoreVert
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { Network, Account } from '../../background/services/wallet';

interface DashboardProps {
  selectedNetwork: string;
  accounts: Account[];
  onNetworkChange: (network: string) => void;
  onLockWallet: () => void;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedNetwork,
  accounts,
  onNetworkChange,
  onLockWallet
}) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [networkMenuAnchor, setNetworkMenuAnchor] = useState<null | HTMLElement>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      setSelectedAccount(accounts[0]);
      loadBalances(accounts[0].address);
    }
  }, [accounts]);

  const loadBalances = async (address: string) => {
    try {
      setLoading(true);
      const response = await chrome.runtime.sendMessage({
          type: 'GET_BALANCE',
        address
      });

      if (response.success) {
        setBalance(response.result);
      }

      // Load token balances
      const tokenResponse = await chrome.runtime.sendMessage({
        type: 'GET_TOKEN_BALANCES',
        address
      });

      if (tokenResponse.success) {
        setTokenBalances(tokenResponse.result);
      }
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNetworkMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setNetworkMenuAnchor(event.currentTarget);
  };

  const handleNetworkMenuClose = () => {
    setNetworkMenuAnchor(null);
  };

  const handleNetworkChange = (network: string) => {
    onNetworkChange(network);
    handleNetworkMenuClose();
  };

  const handleCopyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
    }
  };

  const handleSend = async () => {
    if (!selectedAccount || !sendAmount || !sendAddress) return;

    try {
      setSendLoading(true);
      const response = await chrome.runtime.sendMessage({
        type: 'SEND_TRANSACTION',
        from: selectedAccount.address,
        to: sendAddress,
        value: ethers.utils.parseEther(sendAmount).toString()
      });

      if (response.success) {
        setSendDialogOpen(false);
        setSendAmount('');
        setSendAddress('');
        loadBalances(selectedAccount.address);
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
    } finally {
      setSendLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedAccount) {
      loadBalances(selectedAccount.address);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 2 }}>
        {/* Network Selection */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={selectedNetwork}
            onClick={handleNetworkMenuClick}
            color="primary"
            variant="outlined"
          />
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Account Selection */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Account</Typography>
            <IconButton onClick={handleCopyAddress}>
              <ContentCopy />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {selectedAccount?.address}
          </Typography>
        </Paper>

        {/* Balance */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Balance</Typography>
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Box>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
            <Typography variant="h4">
              {parseFloat(balance).toFixed(4)} ETH
            </Typography>
          )}
        </Paper>

        {/* Token Balances */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Tokens</Typography>
          <List>
            {tokenBalances.map((token) => (
              <ListItem key={token.address}>
                <ListItemText
                  primary={token.symbol}
                  secondary={parseFloat(token.balance).toFixed(4)}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Send />}
            onClick={() => setSendDialogOpen(true)}
            >
              Send
            </Button>
            <Button
              variant="contained"
              startIcon={<SwapHoriz />}
            >
              Swap
            </Button>
          </Box>

        {/* Menus */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { handleMenuClose(); onLockWallet(); }}>
            Lock Wallet
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            Settings
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={networkMenuAnchor}
          open={Boolean(networkMenuAnchor)}
          onClose={handleNetworkMenuClose}
        >
          <MenuItem onClick={() => handleNetworkChange('1')}>Mainnet</MenuItem>
          <MenuItem onClick={() => handleNetworkChange('5')}>Goerli</MenuItem>
          <MenuItem onClick={() => handleNetworkChange('137')}>Polygon</MenuItem>
        </Menu>

        {/* Send Dialog */}
        <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)}>
          <DialogTitle>Send ETH</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Recipient Address"
              fullWidth
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Amount (ETH)"
              fullWidth
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSend}
              variant="contained"
              disabled={sendLoading}
            >
              {sendLoading ? <CircularProgress size={24} /> : 'Send'}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
    </Container>
  );
};

export default Dashboard; 