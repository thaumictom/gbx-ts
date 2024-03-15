import Node from './Node';

/**
 * Skin of a block.
 * @chunk 0x03059000
 */
export default class CGameCtnBlockSkin extends Node {
	public foregroundPackDesc?: string;
	public packDesc?: string;
	public parentPackDesc?: string;
	public text?: string;

	/**
	 * Text
	 */
	protected 0x03059000 = ({ r }: Chunk, f: ChunkFunctions) => {
		this.text = r.readString();

		f.readUnknown(r.readString());
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
	protected 0x03059003 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());

		this.foregroundPackDesc = r.readFileReference();
	};
}
