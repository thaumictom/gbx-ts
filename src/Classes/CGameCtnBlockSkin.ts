/**
 * Skin of a block.
 * @chunk 0x03059000
 */
export default class CGameCtnBlockSkin {
	public text?: string;
	public packDesc?: string;
	public parentPackDesc?: string;
	public foregroundPackDesc?: string;

	/**
	 * Text
	 */
	protected 0x03059000 = ({ r }: Chunk) => {
		this.text = r.readString();
		const u01 = r.readString();
	};

	/**
	 * Skin
	 */
	protected 0x03059001 = ({ r }: Chunk) => {
		this.text = r.readString();
		this.packDesc = r.readFileReference();
	};

	/**
	 * Skin and parent skin
	 */
	protected 0x03059002 = ({ r }: Chunk) => {
		this.text = r.readString();
		this.packDesc = r.readFileReference();
		this.parentPackDesc = r.readFileReference();
	};

	/**
	 * Secondary skin
	 */
	protected 0x03059003 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		this.foregroundPackDesc = r.readFileReference();
	};
}
