/** Build readable count phrases for status text (e.g. "1 row", "2 findings"). */
export function countLabel(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
