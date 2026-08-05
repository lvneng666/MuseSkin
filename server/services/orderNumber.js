/** Human-facing order number: PF-<base36 timestamp>-<random>. */
export function generateOrderNo() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PF-${ts}-${rand}`;
}
