

---

## CodeSentinal Wiki Update

**Reason:** The 'index.md' file serves as the main entry point for the wiki. It should be updated to include information about the new LLM-generated core wiki pages and the file-by-file wiki structure, as well as how the wiki is used in the PR review process.

## How CodeSentinal Uses This Wiki

```txt
PR chunk
→ identify changed filename
→ load matching file wiki
→ load architecture and review rules
→ optionally load related file wiki
→ send context + chunk to LLM
→ post context-aware review comment
```

## Maintenance

This wiki should be regenerated after code is merged into main.
