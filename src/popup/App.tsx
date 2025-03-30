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
import WalletRecover from "./components/WalletRecover";
import Dashboard from "./components/Dashboard";
import { WalletState, getWalletState } from "./utils/wallet";
import { ExtensionMessage } from "../types/messages";

const App: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    loadWalletState();

    // Add listener for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.isInitialized || changes.isLocked) {
        loadWalletState();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadWalletState = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
      
      // Check if setup is complete
      chrome.storage.local.get(['setupComplete'], (result) => {
        setSetupComplete(!!result.setupComplete);
      });
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
        } as ExtensionMessage, (response) => {
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
        } as ExtensionMessage, (response) => {
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

  const handleRecoverWallet = async (seedPhrase: string, newPassword: string) => {
    try {
      setLoading(true);
      return new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "RECOVER_WALLET",
          seedPhrase,
          password: newPassword,
        } as ExtensionMessage, (response) => {
          if (response.success) {
            loadWalletState().then(() => {
              setNotification("Wallet recovered successfully");
              setIsRecovering(false);
              resolve();
            });
          } else {
            reject(new Error(response.error || "Failed to recover wallet"));
          }
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to recover wallet");
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
        } as ExtensionMessage, (response) => {
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
        } as ExtensionMessage, (response) => {
          if (response.success) {
            loadWalletState().then(() => {
              setNotification("Network changed");
              resolve();
            });
          } else {
            reject(new Error(response.error || "Failed to change network"));
          }
        });
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to change network");
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
      {!walletState?.isInitialized || !setupComplete ? (
        <WalletSetup onCreateWallet={handleCreateWallet} />
      ) : walletState.isLocked ? (
        isRecovering ? (
          <WalletRecover 
            onRecover={handleRecoverWallet}
            onCancel={() => setIsRecovering(false)}
          />
        ) : (
          <WalletUnlock 
            onUnlock={handleUnlockWallet}
            onForgotPassword={() => setIsRecovering(true)}
          />
        )
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
