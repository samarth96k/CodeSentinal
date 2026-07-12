export function debugJson(
  label: string,
  data: unknown
): void {
  console.log(
    `\n========== ${label} ==========\n`
  );

  console.log(
    JSON.stringify(
      data,
      null,
      2
    )
  );

  console.log(
    `\n========== END ${label} ==========\n`
  );
}