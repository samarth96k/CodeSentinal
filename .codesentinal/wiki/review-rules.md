

---

## CodeSentinal Wiki Update

**Reason:** The LLM review process now explicitly leverages wiki context. The review rules need to be updated to reflect this, emphasizing the use of architecture, file-specific wikis, and other contextual information for more informed reviews.

## Wiki-Aware Review Rule

Before reviewing a chunk, CodeSentinal should use:

- architecture context
- review rules
- matching file wiki
- related file wiki pages when available

This ensures the LLM reviews code with repository context, not only raw diff text.
