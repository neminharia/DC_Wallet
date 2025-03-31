import { WalletService } from "./services/wallet";
import { GanacheProvider } from "./providers/ganache";
import { TransactionService } from "./services/transaction";

class BackgroundService {
  private walletService: WalletService;
  private ganacheProvider: GanacheProvider;
  private transactionService: TransactionService;

  constructor() {
    this.walletService = new WalletService();
    this.ganacheProvider = new GanacheProvider(this.walletService);
    this.transactionService = new TransactionService(this.walletService);
    this.initialize();
  }

  private initialize() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; 
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
          const balance = await this.transactionService.getBalance(message.address, message.network);
          sendResponse({ success: true, data: balance });
          break;

        case "SEND_TRANSACTION":
          const result = await this.transactionService.sendTransaction(message.params);
          sendResponse({ success: true, data: result });
          break;

        case "SIGN_MESSAGE":
          const signature = await this.ganacheProvider.signMessage(
            message.address,
            message.message
          );
          sendResponse({ success: true, result: signature });
          break;

        case "SWITCH_NETWORK":
          await this.walletService.switchNetwork(message.network);
          const newState = await this.walletService.getWalletStatus();
          sendResponse({ success: true, result: newState });
          break;

        case "ESTIMATE_GAS":
          const gasPrice = await this.transactionService.estimateGas(message.params);
          sendResponse({ success: true, data: gasPrice });
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

new BackgroundService();
