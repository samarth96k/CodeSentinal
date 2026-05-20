# CodeSentinal AI Code Review Workflow

This workflow automates AI-powered code reviews for pull requests. It is triggered when a pull request is opened, synchronized (new commits pushed), or reopened.

## Purpose

The primary purpose of this workflow is to provide an automated AI code review for changes submitted via pull requests. It leverages AI to analyze code and provide feedback, aiming to improve code quality and consistency.

## Workflow Configuration

*   **Name:** `CodeSentinal AI Code Review`
*   **Trigger:** The workflow runs on `pull_request_target` events with the following types:
    *   `opened`: When a new pull request is created.
    *   `synchronize`: When new commits are pushed to an existing pull request.
    *   `reopened`: When a closed pull request is reopened.
*   **Permissions:** The workflow is granted read access to repository `contents` and write access to `pull-requests`. This allows it to checkout code and post review comments.
*   **Runner:** The job executes on `ubuntu-latest`.

## Jobs and Steps

### `ai-code-review` Job

This job orchestrates the AI code review process.

*   **Checkout original repository code:**
    *   Uses the `actions/checkout@v4` action.
    *   Checks out the code from the `main` branch. This is important for comparing against the incoming pull request.
*   **Setup Node.js:**
    *   Uses the `actions/setup-node@v4` action.
    *   Configures the environment to use Node.js version 24.
*   **Install dependencies:**
    *   Executes `npm install` to install project dependencies.
*   **Build TypeScript:**
    *   Executes `npm run build` to compile TypeScript code into JavaScript.
*   **Run AI Code Review:**
    *   Executes the AI review logic using `node dist/index.js`.
    *   **Environment Variables:**
        *   `GITHUB_TOKEN`: Injected automatically by GitHub Actions, providing authentication for GitHub API interactions.
        *   `GEMINI_API_KEY`: Requires a secret named `GEMINI_API_KEY` to be configured in the repository's secrets for access to the Gemini API.

## Risks and Review Considerations

*   **`pull_request_target` Trigger:** Using `pull_request_target` means the workflow runs in the context of the *base* branch (e.g., `main`), not the pull request branch. This is generally safer for untrusted forks as it prevents malicious code from executing in the workflow runner itself. However, careful review is still needed to ensure the AI review logic does not inadvertently execute or misuse code from the pull request branch in unintended ways.
*   **GitHub Token Permissions:** The workflow requests `contents: read` and `pull-requests: write` permissions. Ensure these are the minimum required permissions for the workflow's intended functionality. Overly broad permissions increase the blast radius if the workflow is compromised.
*   **Secrets Management:** The workflow relies on `secrets.GEMINI_API_KEY`. Verify that this secret is properly configured and that its value is only accessible to authorized personnel or services.
*   **Workflow File Integrity:** As with any workflow file, ensure this file is minimally privileged and triggers are used safely. Any changes to the workflow file itself should be reviewed thoroughly to prevent introducing vulnerabilities or unintended behavior.
*   **AI Service Dependency:** The workflow depends on an external AI service (Gemini API). Ensure there are mechanisms in place to handle potential API errors, rate limits, or service outages.

## Pull Request Review Guidance

When reviewing changes to this workflow file, pay close attention to:

1.  **Trigger Modifications:** Any changes to the `on` trigger configuration.
2.  **Permission Adjustments:** Increases in granted permissions.
3.  **Environment Variables:** Addition or modification of environment variables, especially those related to secrets.
4.  **`run` commands:** Any changes to the commands executed, particularly the `npm install`, `npm run build`, and `node dist/index.js` steps.
5.  **Dependencies:** New dependencies introduced by `npm install`.
6.  **Security Implications:** Evaluate any potential security risks introduced by the changes, particularly concerning the use of the GitHub token and external API keys.
