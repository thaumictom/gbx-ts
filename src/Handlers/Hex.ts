/**
 * Handles hexadecimal numbers.
 */
export default class Hex {
	/**
	 * Converts a decimal number to a hexadecimal string.
	 * @param decimal The decimal number to convert.
	 * @returns A hexadecimal string.
	 */
	public static fromDecimal(decimal: number): string {
		return decimal.toString(16);
	}
}
