import { updateWiki } from "./updateWiki.js";

updateWiki().catch((error) => {
  console.error("[CodeSentinal Wiki] Update failed:", error);
  process.exit(1);
});