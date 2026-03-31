const isProduction = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'production'

/**
 * Lightweight logger that only outputs in non-production environments.
 */
export const logger = {
  debug(...args: unknown[]): void {
    if (!isProduction) {
      console.debug('[B-BOARD]', ...args)
    }
  },
  error(...args: unknown[]): void {
    // Errors are logged even in production, but prefixed
    console.error('[B-BOARD ERROR]', ...args)
  },
  info(...args: unknown[]): void {
    if (!isProduction) {
      console.info('[B-BOARD]', ...args)
    }
  },
}
