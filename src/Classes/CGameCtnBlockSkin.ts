/**
 * Chunk 0x03059000
 */
export default class CGameCtnBlockSkin {
	public text: string;
	public packDesc: string;
	public parentPackDesc: string;
	public foregroundPackDesc: string;

	protected 0x03059002 = ({ r }: Chunk) => {
		this.text = r.readString();
		this.packDesc = r.readFileReference();
		this.parentPackDesc = r.readFileReference();
	};

	protected 0x03059003 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		this.foregroundPackDesc = r.readFileReference();
	};
}
