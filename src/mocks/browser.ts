import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Configure and export the service worker setup for browser environments (FE-12.1).
 */
export const worker = setupWorker(...handlers);
