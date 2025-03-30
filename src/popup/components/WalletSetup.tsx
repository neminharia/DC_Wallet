import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  TextField,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import PasswordInput from "./PasswordInput";
import ResumeSetupDialog from "./ResumeSetupDialog";
import { SetupPhase, SetupProgress } from "../types/setup";
import { hashPassword, verifyPassword } from "../utils/crypto";

interface WalletSetupProps {
  onCreateWallet: (password: string) => Promise<void>;
}

const WalletSetup: React.FC<WalletSetupProps> = ({ onCreateWallet }) => {
  // Setup state management
  const [setupProgress, setSetupProgress] = useState<SetupProgress>({
    phase: 'choose',
    type: null,
    timestamp: Date.now()
  });
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [importPhrase, setImportPhrase] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SetupProgress | null>(null);

  // Load saved setup progress
  useEffect(() => {
    checkSavedProgress();
  }, []);

  const checkSavedProgress = async () => {
    const result = await chrome.storage.local.get(['setupProgress']);
    if (result.setupProgress) {
      const progress: SetupProgress = result.setupProgress;
      
      // Check if setup is older than 1 hour
      const now = Date.now();
      if (now - progress.timestamp > 60 * 60 * 1000) {
        // Delete old setup
        await chrome.storage.local.remove(['setupProgress']);
        return;
      }

      // If we're in a sensitive phase, show resume dialog
      if (['view_seed', 'confirm_seed', 'import_wallet'].includes(progress.phase)) {
        setSavedProgress(progress);
        setShowResumeDialog(true);
      } else {
        // For non-sensitive phases, just restore the progress
        restoreProgress(progress);
      }
    }
  };

  const restoreProgress = (progress: SetupProgress) => {
    setSetupProgress(progress);
    if (progress.password) setPassword(progress.password);
    if (progress.mnemonic) setMnemonic(progress.mnemonic);
  };

  const handleResumeSetup = async (enteredPassword: string) => {
    if (!savedProgress || !savedProgress.passwordHash) {
      throw new Error("No saved progress found");
    }

    // Verify password
    const isValid = await verifyPassword(enteredPassword, savedProgress.passwordHash);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    // Restore progress
    restoreProgress(savedProgress);
    setShowResumeDialog(false);
  };

  const handleDeleteSetup = async () => {
    await chrome.storage.local.remove(['setupProgress']);
    setSavedProgress(null);
    setShowResumeDialog(false);
    // Reset to initial state
    setSetupProgress({
      phase: 'choose',
      type: null,
      timestamp: Date.now()
    });
  };

  const updateSetupProgress = async (updates: Partial<SetupProgress>) => {
    const newProgress: SetupProgress = { 
      ...setupProgress, 
      ...updates,
      timestamp: Date.now(),
      phase: updates.phase || setupProgress.phase
    };

    // If setting password, store its hash
    if (updates.password && !newProgress.passwordHash) {
      newProgress.passwordHash = await hashPassword(updates.password);
    }

    setSetupProgress(newProgress);
    await chrome.storage.local.set({ setupProgress: newProgress });
  };

  const handleCreatePassword = async () => {
    try {
      setError("");
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (setupProgress.type === 'create') {
        // Create new wallet
        const response = await new Promise<{ success: boolean; result?: { mnemonic: string }; error?: string }>((resolve) => {
          chrome.runtime.sendMessage({
            type: "CREATE_WALLET",
            password,
          }, resolve);
        });

        if (!response.success || !response.result) {
          throw new Error(response.error || "Failed to create wallet");
        }

        await updateSetupProgress({
          phase: 'view_seed',
          password,
          isPasswordSet: true,
          mnemonic: response.result.mnemonic
        });
        setMnemonic(response.result.mnemonic);
      } else if (setupProgress.type === 'import') {
        await updateSetupProgress({
          phase: 'import_wallet',
          password,
          isPasswordSet: true
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create password");
    }
  };

  const handleImportWallet = async () => {
    try {
      setError("");
      if (!importPhrase.trim()) {
        throw new Error("Please enter your recovery phrase");
      }
      
      const words = importPhrase.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        throw new Error("Invalid recovery phrase. Please enter 12 or 24 words");
      }

      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        chrome.runtime.sendMessage({
          type: "RECOVER_WALLET",
          seedPhrase: importPhrase.trim(),
          password,
        }, resolve);
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to import wallet");
      }

      await handleFinish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import wallet");
    }
  };

  const handleViewSeed = async () => {
    if (!hasAcknowledgedWarning) {
      setError("Please acknowledge that you understand the importance of your recovery phrase");
      return;
    }
    await updateSetupProgress({
      phase: 'confirm_seed',
      isSeedViewed: true
    });
  };

  const handleConfirmSeed = async () => {
    try {
      const mnemonicWords = mnemonic.split(" ");
      // Check if selected words match the original mnemonic
      if (selectedWords.join(" ") !== mnemonic) {
        throw new Error("Selected words don't match your recovery phrase. Please try again.");
      }

      await updateSetupProgress({
        phase: 'complete',
        isSeedConfirmed: true
      });
      await handleFinish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm recovery phrase");
    }
  };

  const handleFinish = async () => {
    try {
      await chrome.storage.local.set({ setupComplete: true });
      // Clear setup progress after successful completion
      await chrome.storage.local.remove(['setupProgress']);
      
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "COMPLETE_SETUP",
        }, (response) => {
          if (response.success) resolve();
          else reject(new Error(response.error || "Failed to complete setup"));
        });
      });

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete setup");
    }
  };

  const renderSetupWarning = () => {
    let warningMessage = "";
    switch (setupProgress.phase) {
      case 'create_password':
        warningMessage = "You haven't finished creating your password. Please complete this step to secure your wallet.";
        break;
      case 'view_seed':
        warningMessage = "You haven't backed up your recovery phrase. This is crucial for wallet recovery!";
        break;
      case 'confirm_seed':
        warningMessage = "Please confirm your recovery phrase to ensure you've saved it correctly.";
        break;
      case 'import_wallet':
        warningMessage = "You haven't completed importing your wallet. Please finish the import process.";
        break;
    }

    if (warningMessage) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warningMessage}
        </Alert>
      );
    }
    return null;
  };

  const renderPhaseContent = () => {
    switch (setupProgress.phase) {
      case 'choose':
        return (
          <Stack spacing={2}>
            <Typography variant="h5" gutterBottom align="center">
              Welcome to Web3 Wallet
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Get started by creating a new wallet or importing an existing one
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => updateSetupProgress({ phase: 'create_password', type: 'create' })}
            >
              Create New Wallet
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => updateSetupProgress({ phase: 'create_password', type: 'import' })}
            >
              Import Existing Wallet
            </Button>
          </Stack>
        );

      case 'create_password':
        return (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create a strong password to secure your wallet
            </Typography>

            <PasswordInput
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              error={error}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleCreatePassword}
              disabled={!password || !confirmPassword}
              sx={{ mt: 2 }}
            >
              Continue
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => {
                updateSetupProgress({ phase: 'choose' as SetupPhase, type: null, timestamp: Date.now() });
                setPassword("");
                setConfirmPassword("");
                setError("");
              }}
              sx={{ mt: 1 }}
            >
              Back
            </Button>
          </>
        );

      case 'view_seed':
        return (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This is your wallet recovery phrase. Write it down and store it securely.
              You'll need this to recover your wallet.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              value={mnemonic}
              InputProps={{ readOnly: true }}
              sx={{ mt: 2, mb: 2 }}
            />

            <Alert severity="warning" sx={{ mb: 2 }}>
              Never share your recovery phrase with anyone. Store it securely offline.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={hasAcknowledgedWarning}
                  onChange={(e) => setHasAcknowledgedWarning(e.target.checked)}
                />
              }
              label="I understand that if I lose my recovery phrase, I will not be able to access my wallet"
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleViewSeed}
              disabled={!hasAcknowledgedWarning}
              sx={{ mt: 2 }}
            >
              Next
            </Button>
          </>
        );

      case 'confirm_seed':
        return (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select each word in the correct order to confirm you've saved your recovery phrase
            </Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
              {/* Add seed confirmation UI here */}
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter your recovery phrase to confirm"
                value={selectedWords.join(" ")}
                onChange={(e) => setSelectedWords(e.target.value.split(" "))}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirmSeed}
              disabled={!selectedWords.length}
              sx={{ mt: 2 }}
            >
              Confirm Recovery Phrase
            </Button>
          </>
        );

      case 'import_wallet':
        return (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your 12 or 24-word recovery phrase to import your existing wallet
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter your recovery phrase"
              value={importPhrase}
              onChange={(e) => setImportPhrase(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleImportWallet}
              disabled={!importPhrase.trim()}
              sx={{ mt: 2 }}
            >
              Import Wallet
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => {
                updateSetupProgress({ phase: 'choose' as SetupPhase, type: null, timestamp: Date.now() });
                setImportPhrase("");
                setError("");
              }}
              sx={{ mt: 1 }}
            >
              Back
            </Button>
          </>
        );
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          {renderSetupWarning()}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {renderPhaseContent()}
        </CardContent>
      </Card>

      <ResumeSetupDialog
        open={showResumeDialog}
        phase={savedProgress?.phase || 'choose'}
        onConfirm={handleResumeSetup}
        onDelete={handleDeleteSetup}
      />
    </>
  );
};

export default WalletSetup;
