import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import WalletSetup from "./components/WalletSetup";
import WalletUnlock from "./components/WalletUnlock";
import Dashboard from "./components/Dashboard";
import { WalletState, getWalletState } from "./utils/wallet";

const App: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadWalletState();
  }, []);

  const loadWalletState = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
    } catch (err) {
      setError("Failed to load wallet state");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async (password: string) => {
    try {
      setLoading(true);
      return new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "CREATE_WALLET",
          password,
        } as ExtensionMessage, (response: ExtensionResponse) => {
          if (response.success) {
            loadWalletState().then(() => {
              setNotification("Wallet created successfully");
              resolve();
            });
          } else {
            reject(new Error(response.error || "Failed to create wallet"));
          }
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockWallet = async (password: string) => {
    try {
      setLoading(true);
      return new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "UNLOCK_WALLET",
          password,
        } as ExtensionMessage, (response: ExtensionResponse) => {
          if (response.success) {
            loadWalletState().then(() => {
              setNotification("Wallet unlocked");
              resolve();
            });
          } else {
            reject(new Error(response.error || "Failed to unlock wallet"));
          }
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to unlock wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLockWallet = async () => {
    try {
      setLoading(true);
      return new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "LOCK_WALLET",
        } as ExtensionMessage, (response: ExtensionResponse) => {
          if (response.success) {
            loadWalletState().then(() => {
              setNotification("Wallet locked");
              resolve();
            });
          } else {
            reject(new Error(response.error || "Failed to lock wallet"));
          }
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to lock wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = async (network: string) => {
    try {
      setLoading(true);
      return new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "SWITCH_NETWORK",
          network,
        } as ExtensionMessage, (response: ExtensionResponse) => {
          if (response.success) {
            loadWalletState().then(() => {
              setNotification(`Switched to ${network}`);
              resolve();
            });
          } else {
            reject(new Error(response.error || "Failed to switch network"));
          }
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to switch network");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setNotification("Address copied to clipboard");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {!walletState?.isInitialized ? (
        <WalletSetup onCreateWallet={handleCreateWallet} />
      ) : walletState.isLocked ? (
        <WalletUnlock onUnlock={handleUnlockWallet} />
      ) : (
        <Dashboard
          selectedNetwork={walletState.selectedNetwork}
          accounts={walletState.accounts[walletState.selectedNetwork]}
          onNetworkChange={handleNetworkChange}
          onLockWallet={handleLockWallet}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
      >
        <Alert severity="success" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
