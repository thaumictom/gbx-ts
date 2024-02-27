export class Logger {
	static reset = '\x1b[0m'; // Reset color

	static highlight(text: string, colorCode: number = 35): string {
		const color = `\x1b[${colorCode}m`;
		return `${color}${text}${this.reset}`;
	}

	public static log(...args: any[]): void {
		console.log(this.highlight('[INFO]', 34), ...args);
	}

	public static debug(...args: any[]): void {
		if (process.env.DEVEL !== 'true') return;
		console.log(this.highlight('[DEBUG]', 35), ...args);
	}

	public static warn(...args: any[]): void {
		console.warn(this.highlight('[WARN]', 33), ...args);
	}

	public static error(...args: any[]): void {
		console.error(this.highlight('[ERROR]', 31), ...args);
	}

	public static outline(...args: any[]): void {
		if (process.env.DEVEL !== 'true') return;
		console.log(this.highlight('[DEVEL]', 41), this.highlight(args[0], 35), ...args.slice(1));
	}
}
