import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Alert,
} from '@mui/material';
import { SetupPhase } from '../types/setup';

interface ResumeSetupDialogProps {
  open: boolean;
  phase: SetupPhase;
  onConfirm: (password: string) => Promise<void>;
  onDelete: () => void;
}

const ResumeSetupDialog: React.FC<ResumeSetupDialogProps> = ({
  open,
  phase,
  onConfirm,
  onDelete,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const getPhaseDescription = (phase: SetupPhase): string => {
    switch (phase) {
      case 'view_seed':
        return 'You were in the process of backing up your recovery phrase';
      case 'confirm_seed':
        return 'You were confirming your recovery phrase';
      case 'import_wallet':
        return 'You were importing an existing wallet';
      case 'create_password':
        return 'You were creating a new password';
      case 'choose':
        return 'You were choosing between creating or importing a wallet';
      case 'complete':
        return 'Setup was completed';
      default:
        return 'You have a pending wallet setup';
    }
  };

  const handleConfirm = async () => {
    try {
      setIsVerifying(true);
      setError('');
      await onConfirm(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify password');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleListItemClick = () => {
    setShowPasswordInput(true);
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        {showPasswordInput ? 'Resume Setup' : 'Pending Wallet Setup'}
      </DialogTitle>
      <DialogContent>
        {!showPasswordInput ? (
          <>
            <Typography variant="body1" gutterBottom>
              You have a pending wallet setup that needs to be completed.
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleListItemClick}>
                  <ListItemText
                    primary={getPhaseDescription(phase)}
                    secondary="Click to continue with this setup"
                  />
                </ListItemButton>
              </ListItem>
            </List>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              If you don't want to continue, you can delete this setup and start fresh.
              The pending setup will be automatically deleted after 1 hour.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Please enter your password to continue with the setup.
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              disabled={isVerifying}
              sx={{ mt: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {showPasswordInput ? (
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!password || isVerifying}
          >
            Continue
          </Button>
        ) : (
          <Button onClick={onDelete} color="error">
            Delete Setup
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResumeSetupDialog; 