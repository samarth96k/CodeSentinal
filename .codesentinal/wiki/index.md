# CodeSentinal Wiki

Welcome to the **CodeSentinal** documentation hub. This repository serves as an automated LLM-powered code review and documentation maintenance system.

## Repository Overview

- **Total Files:** 55
- **Source Files:** 40
- **Workflow Files:** 3
- **Config Files:** 8
- **Test Files:** 0

## Tech Stack

*   **GitHub Actions:** Workflow automation
*   **GitHub Octokit:** API integration
*   **Node.js & TypeScript:** Core runtime and language
*   **OpenAI API:** LLM integration
*   **Zod:** Schema validation
*   **dotenv:** Environment configuration

---

## File Documentation

### Workflows & Configuration
- [.github/workflows/codeSentinal.yml](.codesentinal/wiki/files/_github_workflows_codeSentinal_yml.md) — GitHub API integration.
- [.github/workflows/codesentinal-wiki-init.yml](.codesentinal/wiki/files/_github_workflows_codesentinal-wiki-init_yml.md) — LLM Wiki system initialization.
- [.github/workflows/codesentinal-wiki-pr-update.yml](.codesentinal/wiki/files/_github_workflows_codesentinal-wiki-pr-update_yml.md) — LLM Wiki PR update automation.
- [action.yml](.codesentinal/wiki/files/action_yml.md) — Project configuration.
- [package.json](.codesentinal/wiki/files/package_json.md) — Project metadata and dependencies.
- [tsconfig.json](.codesentinal/wiki/files/tsconfig_json.md) — TypeScript configuration.

### Core Source Files
- [src/index.ts](.codesentinal/wiki/files/src_index_ts.md) — Entry point and core execution logic.
- [src/diffParser.ts](.codesentinal/wiki/files/src_diffParser_ts.md) — PR diff and chunk parsing.
- [src/github.ts](.codesentinal/wiki/files/src_github_ts.md) — GitHub API communication.
- [src/llm.ts](.codesentinal/wiki/files/src_llm_ts.md) — LLM prompt construction and interface.
- [src/prompt.ts](.codesentinal/wiki/files/src_prompt_ts.md) — Logic for building review prompts.
- [src/chunk.ts](.codesentinal/wiki/files/src_chunk_ts.md) — Data structures for code chunking.
- [src/prePrcessParsedFile.ts](.codesentinal/wiki/files/src_prePrcessParsedFile_ts.md) — File filtering and preprocessing.
- [src/config/runtimeConfig.ts](.codesentinal/wiki/files/src_config_runtimeConfig_ts.md) — Runtime configuration.

### LLM Wiki System
The project includes a robust internal system for self-documenting and maintaining the wiki:

- **Initialization & CLI:** [src/wiki/initWiki.ts](.codesentinal/wiki/files/src_wiki_initWiki_ts.md), [src/wiki/initWikiCli.ts](.codesentinal/wiki/files/src_wiki_initWikiCli_ts.md).
- **Generation & Planning:** [src/wiki/llmWikiGenerator.ts](.codesentinal/wiki/files/src_wiki_llmWikiGenerator_ts.md), [src/wiki/wikiUpdatePlanner.ts](.codesentinal/wiki/files/src_wiki_wikiUpdatePlanner_ts.md).
- **Analysis:** [src/wiki/analyzer/repoAnalyzer.ts](.codesentinal/wiki/files/src_wiki_analyzer_repoAnalyzer_ts.md), [src/wiki/wikiImpactAnalyzer.ts](.codesentinal/wiki/files/src_wiki_wikiImpactAnalyzer_ts.md).
- **Utilities:** [src/wiki/utils/fileHelpers.ts](.codesentinal/wiki/files/src_wiki_utils_fileHelpers_ts.md), [src/wiki/utils/wikiWriter.ts](.codesentinal/wiki/files/src_wiki_utils_wikiWriter_ts.md).

### Examples
- [examples/codesentinal.yml](.codesentinal/wiki/files/examples_codesentinal_yml.md)
- [examples/mantainer-codesentinal-fork-review-only.yml](.codesentinal/wiki/files/examples_mantainer-codesentinal-fork-review-only_yml.md)
- [examples/mantainer-codesentinal-same-repo-pr-all.yml](.codesentinal/wiki/files/examples_mantainer-codesentinal-same-repo-pr-all_yml.md)

*(For a full list of documentation files, please refer to the `.codesentinal/wiki/files/` directory.)*
