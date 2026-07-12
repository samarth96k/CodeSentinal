function sleep(ms: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

function isRetryableGitHubError(
  error: any
): boolean {
  const status =
    error?.status ??
    error?.response?.status;

  const message = String(
    error?.message ?? ""
  ).toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes(
      "secondary rate limit"
    ) ||
    message.includes(
      "rate limit"
    ) ||
    message.includes(
      "timeout"
    )
  );
}

export async function executeGitHubWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 2000
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;

      if (
        !isRetryableGitHubError(error)
      ) {
        throw error;
      }

      if (
        attempt >= maxRetries
      ) {
        throw error;
      }

      const delay =
        baseDelayMs *
        Math.pow(
          2,
          attempt - 1
        );

      console.log(
        `[CodeSentinal GitHub] Retry ${attempt}/${maxRetries} after ${delay}ms`
      );

      await sleep(delay);
    }
  }
}