import React, { useState } from "react";
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
} from "@mui/material";
import PasswordInput from "./PasswordInput";

interface WalletSetupProps {
  onCreateWallet: (password: string) => Promise<void>;
}

const WalletSetup: React.FC<WalletSetupProps> = ({ onCreateWallet }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mnemonic, setMnemonic] = useState("");

  const handleNext = async () => {
    try {
      setError("");
      if (activeStep === 0) {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const response = await new Promise<{ success: boolean; result?: { mnemonic: string }; error?: string }>((resolve) => {
          chrome.runtime.sendMessage({
            type: "CREATE_WALLET",
            password,
          }, resolve);
        });

        if (!response.success || !response.result) {
          throw new Error(response.error || "Failed to create wallet");
        }

        setMnemonic(response.result.mnemonic);
        setActiveStep((prev) => prev + 1);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create wallet");
      }
    }
  };

  const handleFinish = async () => {
    try {
      // Notify that wallet setup is complete
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: "COMPLETE_SETUP",
        }, (response) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || "Failed to complete setup"));
          }
        });
      });

      // Force reload wallet state to show dashboard
      window.location.reload();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to complete setup");
      }
    }
  };

  const steps = ["Create Password", "Backup Phrase"];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New Wallet
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 ? (
          <Box sx={{ mt: 2 }}>
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
              onClick={handleNext}
              disabled={!password || !confirmPassword}
              sx={{ mt: 2 }}
            >
              Create Wallet
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This is your wallet backup phrase. Write it down and store it securely.
              You'll need this to recover your wallet.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              value={mnemonic}
              InputProps={{
                readOnly: true,
              }}
              sx={{ mt: 2, mb: 2 }}
            />

            <Alert severity="warning" sx={{ mb: 2 }}>
              Never share your backup phrase with anyone. Store it securely offline.
            </Alert>

            <Button
              variant="contained"
              fullWidth
              onClick={handleFinish}
              sx={{ mt: 2 }}
            >
              I've Saved My Backup Phrase
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletSetup;
