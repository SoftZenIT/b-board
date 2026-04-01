import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger.js';

describe('logger', () => {
  it('logs debug messages in non-production', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('test debug');
    expect(spy).toHaveBeenCalledWith('[B-BOARD]', 'test debug');
    spy.mockRestore();
  });

  it('logs error messages with prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalledWith('[B-BOARD ERROR]', 'test error');
    spy.mockRestore();
  });

  it('logs info messages in non-production', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test info');
    expect(spy).toHaveBeenCalledWith('[B-BOARD]', 'test info');
    spy.mockRestore();
  });
});
