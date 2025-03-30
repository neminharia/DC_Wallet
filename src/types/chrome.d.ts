import { Runtime } from "chrome";

declare global {
  namespace chrome.runtime {
    export const lastError: chrome.runtime.LastError | undefined;
  }
}
