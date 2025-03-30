export type SetupPhase = 
  | 'choose'              // Initial choice between create/import
  | 'create_password'     // Creating new password
  | 'view_seed'          // Viewing the seed phrase
  | 'confirm_seed'       // Confirming the seed phrase
  | 'import_wallet'      // Importing existing wallet
  | 'complete';          // Setup complete

export interface SetupProgress {
  phase: SetupPhase;
  type: 'create' | 'import' | null;
  mnemonic?: string;
  password?: string;
  isPasswordSet?: boolean;
  isSeedViewed?: boolean;
  isSeedConfirmed?: boolean;
  timestamp: number;        // Timestamp when progress was last updated
  passwordHash?: string;    // Hashed password for verification
} 