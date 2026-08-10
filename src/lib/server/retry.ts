type RetryOptions = {
  attempts?: number;
  delayMs?: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryAsync<T>(
  fn: () => Promise<T>,
  { attempts = 3, delayMs = 250 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await wait(delayMs * attempt);
      }
    }
  }

  throw lastError;
}
