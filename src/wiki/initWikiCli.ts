import { initWiki } from "./initWiki.js";

initWiki().catch((error) => {
  console.error("[CodeSentinal Wiki] Initialization failed:", error);
  process.exit(1);
});