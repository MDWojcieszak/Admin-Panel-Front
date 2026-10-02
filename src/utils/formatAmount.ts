/**
 * `18000` → `18 000`. Grouped by hand rather than through `toLocaleString`,
 * whose Polish rules leave four-digit numbers ungrouped (`8999`) and would put
 * "8999" next to "18 000" in the same list. The separator is a no-break space
 * so an amount never wraps in the middle.
 */
export const formatAmount = (value: number): string =>
  String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
