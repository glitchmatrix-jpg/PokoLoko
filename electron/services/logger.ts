export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ranks: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class Logger {
  public constructor(
    private readonly scope: string,
    private readonly minimumLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ) {}

  public debug(message: string, meta?: Readonly<Record<string, unknown>>): void {
    this.write('debug', message, meta);
  }
  public info(message: string, meta?: Readonly<Record<string, unknown>>): void {
    this.write('info', message, meta);
  }
  public warn(message: string, meta?: Readonly<Record<string, unknown>>): void {
    this.write('warn', message, meta);
  }
  public error(message: string, error?: unknown, meta?: Readonly<Record<string, unknown>>): void {
    const safeError = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
    this.write('error', message, { ...meta, error: safeError });
  }

  private write(level: LogLevel, message: string, meta?: Readonly<Record<string, unknown>>): void {
    if (ranks[level] < ranks[this.minimumLevel]) return;
    const entry = { timestamp: new Date().toISOString(), level, scope: this.scope, message, ...(meta ? { meta } : {}) };
    const output = JSON.stringify(entry);
    if (level === 'error') console.error(output);
    else if (level === 'warn') console.warn(output);
    else console.log(output);
  }
}
