import crypto from "crypto";

export function deduplicateReviews<
  T extends {
    filename: string;
    issue: string;
  }
>(
  reviews: T[]
): T[] {
  const seen =
    new Set<string>();

  const result: T[] =
    [];

  for (const review of reviews) {
    const hash =
      crypto
        .createHash("sha256")
        .update(
          review.filename
            .trim()
            .toLowerCase()
        )
        .update(
          review.issue
            .trim()
            .toLowerCase()
        )
        .digest("hex");

    if (seen.has(hash)) {
      continue;
    }

    seen.add(hash);

    result.push(review);
  }

  return result;
}