import { WalletService } from "./services/wallet";
import { GanacheProvider } from "./providers/ganache";

class BackgroundService {
  private walletService: WalletService;
  private ganacheProvider: GanacheProvider;

  constructor() {
    this.walletService = new WalletService();
    this.ganacheProvider = new GanacheProvider(this.walletService);
    this.initialize();
  }

  private initialize() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    try {
      switch (message.type) {
        case "CREATE_WALLET":
          await this.walletService.createWallet(message.password);
          const mnemonic = await this.walletService.getMnemonic();
          sendResponse({ success: true, result: { mnemonic } });
          break;

        case "COMPLETE_SETUP":
          // Handle wallet setup completion
          const state = await this.walletService.getWalletStatus();
          sendResponse({ success: true, result: state });
          break;

        case "UNLOCK_WALLET":
          await this.walletService.unlockWallet(message.password);
          sendResponse({ success: true });
          break;

        case "LOCK_WALLET":
          await this.walletService.lockWallet();
          sendResponse({ success: true });
          break;

        case "RECOVER_WALLET":
          await this.walletService.recoverWallet(message.seedPhrase, message.password);
          sendResponse({ success: true });
          break;

        case "GET_WALLET_STATE":
          const status = await this.walletService.getWalletStatus();
          sendResponse({ success: true, result: status });
          break;

        case "GET_ACCOUNTS":
          const accounts = await this.ganacheProvider.getAccounts();
          sendResponse({ success: true, result: accounts });
          break;

        case "GET_BALANCE":
          const balance = await this.ganacheProvider.getBalance(message.address);
          sendResponse({ success: true, result: balance });
          break;

        case "SEND_TRANSACTION":
          const txHash = await this.ganacheProvider.sendTransaction(message.params);
          sendResponse({ success: true, result: txHash });
          break;

        case "SIGN_MESSAGE":
          const signature = await this.ganacheProvider.signMessage(
            message.address,
            message.message
          );
          sendResponse({ success: true, result: signature });
          break;

        case "SWITCH_NETWORK":
          // Handle network switching
          await this.walletService.switchNetwork(message.network);
          const newState = await this.walletService.getWalletStatus();
          sendResponse({ success: true, result: newState });
          break;

        default:
          console.error("Unknown message type:", message.type);
          sendResponse({
            success: false,
            error: "Unknown message type"
          });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

// Initialize the background service
new BackgroundService();
