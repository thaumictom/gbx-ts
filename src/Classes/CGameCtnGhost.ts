import CGameGhost from './CGameGhost';

/**
 * Chunk 0x03092000
 */
export default class CGameCtnGhost extends CGameGhost {
	public uid?: string;
	public ghostLogin?: string;
	public playerMobilId?: string;
	public eventsDuration?: number;
	public controlNames?: string[];
	public controlEntries?: { time: number; controlNameIndex: number; onoff: number }[];
	public gameVersion?: string;
	public exeChecksum?: number;
	public osKind?: number;
	public cpuKind?: number;
	public raceSettingsXML?: string;

	protected 0x0309200c = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
	};

	protected 0x0309200e = ({ r }: Chunk) => {
		this.uid = r.readLookbackString();
	};

	protected 0x0309200f = ({ r }: Chunk) => {
		this.ghostLogin = r.readString();
	};

	protected 0x03092010 = ({ r }: Chunk) => {
		const u01 = r.readLookbackString();
	};

	protected 0x03092012 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readNumbers(16);
	};

	protected 0x03092015 = ({ r }: Chunk) => {
		this.playerMobilId = r.readLookbackString();
	};

	protected 0x03092018 = ({ r }: Chunk) => {
		const u01 = r.readMeta();
	};

	protected 0x03092019 = ({ r }: Chunk) => {
		this.controlNames = [];
		this.controlEntries = [];

		this.eventsDuration = r.readUInt32();
		const u01 = r.readUInt32();
		const nbControlNames = r.readUInt32();

		for (let i = 0; i < nbControlNames; i++) {
			this.controlNames.push(r.readLookbackString());
		}

		const nbControlEntries = r.readUInt32();
		const u02 = r.readUInt32();

		for (let i = 0; i < nbControlEntries; i++) {
			this.controlEntries.push({
				time: r.readUInt32() + 100000,
				controlNameIndex: r.readByte(),
				onoff: r.readUInt32(),
			});
		}

		this.gameVersion = r.readString();
		this.exeChecksum = r.readUInt32();
		this.osKind = r.readUInt32();
		this.cpuKind = r.readUInt32();
		this.raceSettingsXML = r.readString();
		const u03 = r.readUInt32();
	};
}
