export interface ExtensionResponse {
  success: boolean;
  error?: string;
  result?: any;
}

export type MessageType =
  | "CREATE_WALLET"
  | "UNLOCK_WALLET"
  | "LOCK_WALLET"
  | "GET_WALLET_STATE"
  | "SWITCH_NETWORK"
  | "SEND_TRANSACTION"
  | "RECOVER_WALLET"
  | "COMPLETE_SETUP";

export interface ExtensionMessage {
  type: MessageType;
  password?: string;
  network?: "ethereum" | "solana";
  to?: string;
  amount?: string;
  seedPhrase?: string;
}
