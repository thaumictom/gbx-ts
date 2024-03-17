/**
 * Handles logging.
 */
export default class Logger {
	static showLogs: boolean = false;
	static showDebug: boolean = false;
	static showWarns: boolean = false;

	static reset = '\x1b[0m'; // Reset color

	/**
	 * Highlights the given text with the specified color.
	 * @param text The text to highlight.
	 * @param colorCode The color code to use.
	 * @returns The highlighted text.
	 */
	private static highlight(text: string, colorCode: number = 35): string {
		const color = `\x1b[${colorCode}m`;
		return `${color}${text}${this.reset}`;
	}

	/**
	 * Logs the given arguments to the console with the info prefix.
	 * @param args The arguments to log.
	 */
	public static log(...args: any[]): void {
		if (!this.showLogs) return;
		console.log(this.highlight('[INFO]', 34), ...args);
	}

	/**
	 * Logs the given arguments to the console with the debug prefix.
	 * @param args The arguments to log.
	 */
	public static debug(...args: any[]): void {
		if (!this.showDebug) return;
		console.log(this.highlight('[DEBUG]', 35), ...args);
	}

	/**
	 * Logs the given arguments to the console with the warn prefix.
	 * @param args The arguments to log.
	 */
	public static warn(...args: any[]): void {
		if (!this.showWarns) return;
		console.warn(this.highlight('[WARN]', 33), ...args);
	}

	/**
	 * Logs the given arguments to the console with the error prefix.
	 * @param args The arguments to log.
	 */
	public static error(...args: any[]): void {
		console.error(this.highlight('[ERROR]', 31), ...args);
	}

	/**
	 * Logs the given arguments to the console in a visible way.
	 * @param args The arguments to log.
	 */
	public static outline(...args: any[]): void {
		console.log(this.highlight('[DEVEL]', 41), this.highlight(args[0], 35), ...args.slice(1));
	}
}
