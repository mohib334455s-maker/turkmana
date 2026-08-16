const FALSY = new Set(['false', '0', 'no', 'off']);

/** Demo login is the default. Real Postgres is used only when DEMO_AUTH is off and DATABASE_URL exists. */
export function isDemoAuth(): boolean {
  const flag = process.env.DEMO_AUTH?.trim().toLowerCase();
  if (flag && FALSY.has(flag)) {
    return !process.env.DATABASE_URL;
  }
  return true;
}
