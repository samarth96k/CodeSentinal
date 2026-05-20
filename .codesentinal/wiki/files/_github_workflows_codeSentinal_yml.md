# Workflow: .github/workflows/codeSentinal.yml

## Purpose

This workflow, named "CodeSentinal AI Code Review", automates AI-powered code review for pull requests. It is triggered when a pull request is opened, synchronized (new commits pushed), or reopened.

## Trigger

- **Event**: `pull_request_target`
- **Types**: `opened`, `synchronize`, `reopened`

This trigger is important because it allows the workflow to run on pull requests targeting the repository's `main` branch.

## Permissions

The workflow requests the following permissions:

- `contents: read`: Allows the workflow to read the repository's contents.
- `pull-requests: write`: Allows the workflow to write comments to pull requests.

## Jobs

### `ai-code-review`

This job runs on an `ubuntu-latest` virtual environment.

#### Steps

1.  **Checkout original repository code**:
    - Uses `actions/checkout@v4`.
    - Checks out the code from the `main` branch. This is crucial for ensuring the AI review is performed against the intended target branch, not potentially malicious code from a fork.

2.  **Setup Node.js**:
    - Uses `actions/setup-node@v4`.
    - Configures the environment with Node.js version `24`.

3.  **Install dependencies**:
    - Executes `npm ci` to install project dependencies.

4.  **Build TypeScript**:
    - Executes `npm run build` to build the TypeScript codebase.

5.  **Run AI Code Review**:
    - Executes the Node.js script `dist/index.js` with the `review` argument.
    - **Environment Variables**:
        - `GITHUB_TOKEN`: Automatically provided by GitHub Actions, used for authenticating with the GitHub API.
        - `GEMINI_API_KEY`: Requires a secret named `GEMINI_API_KEY` to be configured in the repository's secrets. This is used to authenticate with the Gemini API for AI code analysis.

## Risks and Review Notes

### GitHub Token and Fork PR Safety

- **Risk**: The workflow uses the `GITHUB_TOKEN`. While generally safe, it's important to ensure the token's permissions (`contents: read`, `pull-requests: write`) are strictly necessary and not overly broad.
- **Review**: When reviewing changes to this workflow, verify that the `GITHUB_TOKEN` is only used for its intended purpose and that the `pull_request_target` trigger is not inadvertently exposing the repository to malicious code execution from forks, especially since the checkout is explicitly set to `main`.

### `pull_request_target` and Untrusted Code

- **Risk**: Using `pull_request_target` on its own can be risky if the repository is open to contributions from untrusted sources (e.g., forks). The `actions/checkout` step is configured to checkout `main`, which mitigates some risk by not checking out the PR's branch directly. However, the `run` commands within the workflow must be carefully reviewed to ensure they do not execute arbitrary code from the pull request itself.
- **Review**: Pay close attention to any steps that execute code or scripts. Ensure that these scripts are not influenced by or executing code from the untrusted source of the pull request. The current checkout to `main` is a good practice for this trigger.

### Workflow File Permissions and Trigger Usage

- **Risk**: Workflow files themselves are powerful. Minimal permissions and safe trigger usage are crucial for security.
- **Review**: Verify that the `permissions` block is as restrictive as possible. Confirm that the `on:` trigger is appropriate and that the workflow is not inadvertently activated by events that could be exploited. The current trigger and permissions seem aligned with the stated purpose of AI code review.

## How to Review PR Changes

When reviewing changes to this file, consider the following:

1.  **Trigger Modifications**: Any changes to the `on:` block could alter when and how the workflow runs. Ensure these changes are intentional and secure.
2.  **Permission Changes**: Any modification to the `permissions:` block must be carefully scrutinized. Only grant necessary permissions.
3.  **Job Steps**:
    *   **`actions/checkout`**: Verify the `ref` being checked out. Checking out `main` is a security measure for `pull_request_target`; ensure this is not changed to a potentially unsafe source.
    *   **Dependency Installation/Build**: Ensure that `npm ci` and `npm run build` are not compromised.
    *   **AI Review Execution**: The `node dist/index.js review` command is the core. Review any changes to how this script is invoked or its arguments.
4.  **Environment Variables**: Ensure that only necessary secrets are exposed and that sensitive information is not hardcoded.
5.  **External Dependencies**: Be aware of any new `uses:` statements for GitHub Actions or external scripts, and vet their trustworthiness.
