import GameVersion from "../Utilities/GameVersion";
import CGameCtnBlock from "./CGameCtnBlock";
import CGameCtnBlockSkin from "./CGameCtnBlockSkin";
import CGameCtnChallengeParameters from "./CGameCtnChallengeParameters";
import CGameCtnCollectorList from "./CGameCtnCollectorList";
import CGameWaypointSpecialProperty from "./CGameWaypointSpecialProperty";

/**
 * A map.
 * @chunk 0x03043000
 */
export default class CGameCtnChallenge extends GameVersion {
    public authorExtraInfo?: string;
    public authorLogin?: string;
    public authorNickname?: string;
    public authorScore?: number;
    public authorTime?: number;
    public authorVersion?: number;
    public authorZone?: string;
    public blocks?: CGameCtnBlock[];
    public blockStock?: CGameCtnCollectorList;
    public bronzeTime?: number;
    public buildVersion?: string;
    public challengeParameters?: CGameCtnChallengeParameters;
    public checkpoints?: Int3[];
    public comments?: string;
    public cost?: number;
    public crc32?: number;
    public createdWithSimpleEditor?: boolean;
    public customMusicPackDesc?: string;
    public dayDuration?: number;
    public dayTime?: number;
    public decoBaseHeightOffset?: number;
    public decoration?: IMeta;
    public dynamicDaylight?: boolean;
    public editorMode?: EditorMode;
    public goldTime?: number;
    public hasCustomCamThumbnail?: boolean;
    public hashedPassword?: number[];
    public headerVersion?: number;
    public isLapRace?: boolean;
    public isMultilap?: boolean;
    public lightmapCacheUid?: number;
    public lightmapVersion?: number;
    public mapCoordOrigin?: Vector2 | number[];
    public mapCoordTarget?: Vector2 | number[];
    public mapInfo?: IMeta;
    public mapKind?: MapKind;
    public mapName?: string;
    public mapStyle?: string;
    public mapType?: string;
    public modPackDesc?: string;
    public nbCheckpoints?: number;
    public nbLaps?: number;
    public needUnlock?: boolean;
    public objectiveTextAuthor?: string;
    public objectiveTextBronze?: string;
    public objectiveTextGold?: string;
    public objectiveTextSilver?: string;
    public offzones?: { 1: Int3; 2: Int3 }[];
    public offzoneTriggerSize?: number[];
    public packMask?: number;
    public password?: string;
    public playerModel?: IMeta;
    public playMode?: PlayMode;
    public silverTime?: number;
    public size?: Int3;
    public thumbnailData?: number[];
    public thumbnailFarClipPlane?: number;
    public thumbnailFov?: number;
    public thumbnailNearClipPlane?: number;
    public thumbnailPitchYawRoll?: Vector3;
    public thumbnailPosition?: Vector3;
    public thumbnailSize?: number;
    public titleId?: string;
    public unlimiter?: number;
    public worldDistortion?: Vector3;
    public xml?: string;

    /**
     * (Header) Map information
     * @games All games
     */
    protected 0x03043002 = ({ r }: Chunk, f: ChunkFunctions) => {
        const version = f.readVersion(r.readByte());

        if (version <= 2) {
            this.mapInfo = r.readMeta();
            this.mapName = r.readString();
        }

        f.readUnknown(r.readBoolean());

        if (version >= 1) {
            this.bronzeTime = r.readUInt32();
            this.silverTime = r.readUInt32();
            this.goldTime = r.readUInt32();
            this.authorTime = r.readUInt32();
        }

        if (version == 2) {
            f.readUnknown(r.readByte());
        }

        if (version >= 4) {
            this.cost = r.readUInt32();
        }

        if (version >= 5) {
            this.isLapRace = r.readBoolean();
        }

        if (version == 6) {
            this.isMultilap = r.readBoolean();
        }

        if (version >= 7) {
            this.playMode = r.readUInt32() as PlayMode;
        }

        if (version >= 9) {
            f.readUnknown(r.readUInt32());
        }

        if (version >= 10) {
            this.authorScore = r.readUInt32();
        }

        if (version >= 11) {
            this.editorMode = r.readUInt32() as EditorMode;
        }

        if (version >= 12) {
            f.readUnknown(r.readUInt32());
        }

        if (version >= 13) {
            this.nbCheckpoints = r.readUInt32();
            this.nbLaps = r.readUInt32();
        }
    };

    /**
     * (Header) Common map information
     * @games All games
     */
    protected 0x03043003 = ({ r }: Chunk, f: ChunkFunctions) => {
        const version = f.readVersion(r.readByte());

        this.mapInfo = r.readMeta();
        this.mapName = r.readString();
        this.mapKind = r.readByte() as MapKind;

        if (version >= 1) {
            f.readUnknown(r.readUInt32());

            this.password = r.readString();
        }

        if (version >= 2) {
            this.decoration = r.readMeta();
        }

        if (version >= 3) {
            this.mapCoordOrigin = r.readVector2();
        }

        if (version >= 4) {
            this.mapCoordTarget = r.readVector2();
        }

        if (version >= 5) {
            this.packMask = r.readNumbers(16);
        }

        if (version >= 6) {
            this.mapType = r.readString();
            this.mapStyle = r.readString();
        }

        if (version >= 8) {
            this.lightmapCacheUid = r.readNumbers(8);
        }

        if (version >= 9) {
            this.lightmapVersion = r.readByte();
        }

        if (version >= 11) {
            this.titleId = r.readLookbackString();
        }
    };

    /**
     * (Header) Header version
     * @games TMSX and above
     */
    protected 0x03043004 = ({ r }: Chunk) => {
        this.headerVersion = r.readUInt32();
    };

    /**
     * (Header) XML data
     * @games TMSX and above
     */
    protected 0x03043005 = ({ r }: Chunk) => {
        this.xml = r.readString();
    };

    /**
     * (Header) Thumnbnail and comments
     * @games TMU and above
     */
    protected 0x03043007 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        this.thumbnailSize = r.readUInt32();

        r.readString("<Thumbnail.jpg>".length);

        this.thumbnailData = r.readBytes(this.thumbnailSize);

        r.readString("</Thumbnail.jpg>".length);
        r.readString("<Comments>".length);

        this.comments = r.readString();

        r.readString("</Comments>".length);
    };

    /**
     * (Header) Author information
     * @games MP3 and above
     */
    protected 0x03043008 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        this.authorVersion = r.readUInt32();
        this.authorLogin = r.readString();
        this.authorNickname = r.readString();
        this.authorZone = r.readString();
        this.authorExtraInfo = r.readString();
    };

    /**
     * Vehicle model
     * @games All games
     */
    protected 0x0304300d = ({ r }: Chunk) => {
        this.playerModel = r.readMeta();
    };

    /**
     * Block data
     * @games TM1.0 only
     */
    protected 0x0304300f = ({ r }: Chunk) => {
        this.mapInfo = r.readMeta();
        this.size = r.readInt3();

        this.blocks = r.createArray(
            r.readUInt32(),
            () => r.readNodeReference<CGameCtnBlock>()!
        );
        this.needUnlock = r.readBoolean();
        this.decoration = r.readMeta();
    };

    /**
     * Puzzle block inventory, challenge parameters and map kind
     * @games All games
     */
    protected 0x03043011 = ({ r }: Chunk) => {
        this.blockStock = r.readNodeReference<CGameCtnCollectorList>();
        this.challengeParameters =
            r.readNodeReference<CGameCtnChallengeParameters>();
        this.mapKind = r.readUInt32() as MapKind;
    };

    /**
     * Legacy block data
     * @games Unknown
     */
    protected 0x03043013 = ({ r }: Chunk, f: ChunkFunctions) => {
        this.mapInfo = r.readMeta();
        this.mapName = r.readString();
        this.decoration = r.readMeta();
        this.size = r.readInt3();

        f.readUnknown(r.readBoolean());

        this.blocks = r.createArray(r.readUInt32(), () => {
            const blockName = r.readLookbackString();
            const direction = r.readByte() as Direction;
            const position = r.readByte3();
            const flags = r.readUInt16();

            return {
                blockName,
                direction,
                position,
                flags,
            };
        });
    };

    /**
     * (Skippable) Legacy password
     * @games TMSX, TMNESWC, TMU
     */
    protected 0x03043014 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readBoolean());

        this.password = r.readString();
    };

    /**
     * (Skippable)
     * @games TMSX, TMNESWC
     */
    protected 0x03043016 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readUInt32());
    };

    /**
     * (Skippable) Checkpoints
     * @games TMSX, TMNESWC, TMU, TMF
     */
    protected 0x03043017 = ({ r }: Chunk) => {
        this.checkpoints = r.createArray(r.readUInt32(), () => r.readInt3());
    };

    /**
     * (Skippable) Lap information
     * @games TMSX and above
     */
    protected 0x03043018 = ({ r }: Chunk) => {
        this.isLapRace = r.readBoolean();
        this.nbLaps = r.readUInt32();
    };

    /**
     * (Skippable) Mod information
     * @games TMSX  and above
     */
    protected 0x03043019 = ({ r }: Chunk) => {
        this.modPackDesc = r.readFileReference();
    };

    /**
     * @games Unknown
     */
    protected 0x0304301a = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readNodeReference());
    };

    /**
     * OldIgs
     * @games Unknown
     */
    protected 0x0304301b = ({ r }: Chunk, f: ChunkFunctions) => {
        const u01 = f.readUnknown(r.readUInt32());

        if (u01 != 0)
            throw new Error("Unexpected value SOldIgs > 0 in chunk 0x0304301b");
    };

    /**
     * (Skippable) Play mode
     * @games TMSX, TMNESWC, TMU, TMF
     */
    protected 0x0304301c = ({ r }: Chunk) => {
        this.playMode = r.readUInt32() as PlayMode;
    };

    /**
     * @games Unknown
     */
    protected 0x0304301d = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readUInt32());
    };

    /**
     * Block data
     * @games TMSX and above
     */
    protected 0x0304301f = ({ r }: Chunk, f: ChunkFunctions) => {
        this.blocks = [];

        this.mapInfo = r.readMeta();
        this.mapName = r.readString();
        this.decoration = r.readMeta();
        this.size = r.readInt3();
        this.needUnlock = r.readBoolean();

        const version = f.readVersion(r.readUInt32());
        const nbBlocks = r.readUInt32();

        const readBlock = (): boolean => {
            const blockName = r.readLookbackString();
            const direction = r.readByte() as Direction;
            const position = r.readByte3();

            let flags = 0;

            if (version > 0) flags = r.readUInt32();
            else flags = r.readUInt16();

            let author: string | undefined;
            let skin: CGameCtnBlockSkin | undefined;
            let waypointSpecialProperty:
                | CGameWaypointSpecialProperty
                | undefined;

            if (flags & (1 << 15)) {
                author = r.readLookbackString();
                skin = r.readNodeReference();
            }
            if (version <= 1) {
                return false;
            } else if (version >= 6) {
                position.x -= 1;
                position.z -= 1;
            }

            if (flags & (1 << 19)) {
                throw new Error("Parsin not possible.");
            }

            if (flags & (1 << 20)) {
                waypointSpecialProperty =
                    r.readNodeReference<CGameWaypointSpecialProperty>();
            }

            if (flags & (1 << 18)) {
                const numSquareCardEvent = r.readUInt32();
                let SquareCardEventIds: any[] = [];
                for (
                    let squareCardEventIdIndex = 0;
                    squareCardEventIdIndex < numSquareCardEvent;
                    squareCardEventIdIndex++
                ) {
                    var squareCardEventId =
                        SquareCardEventIds[squareCardEventIdIndex];
                    r.readNumbers(4); // unknown
                    r.readNumbers(4); // unknown
                    const numEvents = r.readUInt32();
                    for (
                        let eventIdIndex = 0;
                        eventIdIndex < numEvents;
                        eventIdIndex++
                    ) {
                        squareCardEventId[eventIdIndex] =
                            (r.readLookbackString(),
                            r.readLookbackString(),
                            r.readLookbackString());
                    }
                }
            }

            if (flags & (1 << 17)) {
                const decal = r.readLookbackString();
                const decalIntencity = r.readNumbers(4);
                const decalVariant = r.readNumbers(4);
            }

            this.blocks?.push({
                blockName,
                direction,
                position,
                flags,
                author,
                skin,
                waypointSpecialProperty,
            });

            return true;
        };

        for (let i = 0; i < nbBlocks; i++) {
            readBlock();
        }

        // Peek ahead to see if there is any more blocks
        while ((r.peekUInt32() & 0xc0000000) > 0) {
            readBlock();
        }
    };

    /**
     * Deprecated MediaTracker data
     * @games Unknown
     */
    protected 0x03043020 = ({ r, fullChunkId }: Chunk) => {
        r.forceChunkSkip(fullChunkId!);
    };

    /**
     * Legacy MediaTracker data
     * @games TMSX, TMNESWC, TMU, TMF
     */
    protected 0x03043021 = ({ r, fullChunkId }: Chunk) => {
        r.forceChunkSkip(fullChunkId!);
    };

    /**
     * @games TMSX and above
     */
    protected 0x03043022 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readUInt32());
    };

    /**
     * Legacy map origin/target
     * @games Unknown
     */
    protected 0x03043023 = ({ r }: Chunk) => {
        this.mapCoordOrigin = r.readVector2();
        this.mapCoordTarget = this.mapCoordOrigin;
    };

    /**
     * Custom music
     * @games TMSX and above
     */
    protected 0x03043024 = ({ r }: Chunk) => {
        this.customMusicPackDesc = r.readFileReference();
    };

    /**
     * Map origin/target
     * @games TMSX and above
     */
    protected 0x03043025 = ({ r }: Chunk) => {
        this.mapCoordOrigin = r.readVector2();
        this.mapCoordTarget = r.readVector2();
    };

    /**
     * Clip global
     * @games TMNESWC and above
     */
    protected 0x03043026 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readNodeReference());
    };

    /**
     * Old realtime thumbnail
     * @games Unknown
     */
    protected 0x03043027 = ({ r }: Chunk, f: ChunkFunctions) => {
        this.hasCustomCamThumbnail = r.readBoolean();

        if (!this.hasCustomCamThumbnail) return;

        f.readUnknown(r.readByte());
        f.readUnknown(r.readVector3());
        f.readUnknown(r.readVector3());
        f.readUnknown(r.readVector3());

        this.thumbnailPosition = r.readVector3();
        this.thumbnailFov = r.readFloat();
        this.thumbnailNearClipPlane = r.readFloat();
        this.thumbnailFarClipPlane = r.readFloat();
    };

    /**
     * Old realtime thumbnail and comments
     * @games TMU and above
     */
    protected 0x03043028 = (chunk: Chunk, f: ChunkFunctions) => {
        this[0x03043027](chunk, f);
        const { r } = chunk;

        this.comments = r.readString();
    };

    /**
     * (Skippable) Password
     * @games TMF and above
     */
    protected 0x03043029 = ({ r }: Chunk) => {
        this.hashedPassword = r.readBytes(16);
        this.crc32 = r.readUInt32();
    };

    /**
     * Simple editor
     * @games TMF and above
     */
    protected 0x0304302a = ({ r }: Chunk) => {
        this.createdWithSimpleEditor = r.readBoolean();
    };

    /**
     * (Skippable) Realtime thumbnail and comments
     * @games TMF and above
     */
    protected 0x0304302d = ({ r }: Chunk, f: ChunkFunctions) => {
        this.thumbnailPosition = r.readVector3();
        this.thumbnailPitchYawRoll = r.readVector3();
        this.thumbnailFov = r.readFloat();

        f.readUnknown(r.readFloat());
        f.readUnknown(r.readFloat());

        this.thumbnailNearClipPlane = r.readFloat();
        this.thumbnailFarClipPlane = r.readFloat();
        this.comments = r.readString();
    };

    /**
     * (Skippable)
     * @games MP3 and above
     */
    protected 0x03043034 = ({ r }: Chunk) => {
        const length = r.readUInt32();

        r.readBytes(length);
    };

    /**
     * (Skippable) Realtime thumbnail and comments
     * @games MP3 and above
     */
    protected 0x03043036 = (chunk: Chunk, f: ChunkFunctions) => {
        this[0x0304302d](chunk, f);
    };

    /**
     * (Skippable) CarMarksBuffer
     * @games MP3 and above
     */
    // protected 0x0304303e = ({ r }: Chunk) => {};

    /**
     * (Skippable/Encapsulated) Items
     * @games MP3 and above
     */
    protected 0x03043040 = ({ r, length }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        r.readBytes(length! - 4);
    };

    /**
     * (Skippable) Author information
     * @games MP3 and above
     */
    protected 0x03043042 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        this.authorVersion = r.readUInt32();
        this.authorLogin = r.readString();
        this.authorNickname = r.readString();
        this.authorZone = r.readString();
        this.authorExtraInfo = r.readString();
    };

    /**
     * (Skippable) Genealogies
     * @games MP3 and above
     */
    // protected 0x03043043 = ({ r }: Chunk) => {};

    /**
     * (Skippable) Metadata
     * @games MP3 and above
     */
    // protected 0x03043044 = ({ r }: Chunk) => {};

    /**
     * (Skippable)
     * @games MP3, TMT
     */
    protected 0x03043047 = ({ r }: Chunk, f: ChunkFunctions) => {
        const version = f.readVersion(r.readUInt32());

        f.readUnknown(r.readString());

        if (version >= 1)
            throw new Error("Unexpected version >= 1 in chunk 0x03043047");
    };

    /**
     * (Skippable) Baked blocks
     * @games MP3 and above
     */
    // protected 0x03043048 = ({ r }: Chunk) => {};

    /**
     * MediaTracker data
     * @games MP3 and above
     */
    protected 0x03043049 = ({ r, fullChunkId }: Chunk) => {
        r.forceChunkSkip(fullChunkId!);
    };

    /**
     * (Skippable) Objectives
     * @games MP3 and above
     */
    protected 0x0304304b = ({ r }: Chunk) => {
        this.objectiveTextAuthor = r.readString();
        this.objectiveTextGold = r.readString();
        this.objectiveTextSilver = r.readString();
        this.objectiveTextBronze = r.readString();
    };

    /**
     * (Skippable) Offzones
     * @games MP3 and above
     */
    protected 0x03043050 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        this.offzoneTriggerSize = [
            r.readUInt32(),
            r.readUInt32(),
            r.readUInt32(),
        ];

        this.offzones = r.createArray(r.readUInt32(), () => {
            return {
                1: r.readInt3(),
                2: r.readInt3(),
            };
        });
    };

    /**
     * (Skippable) Title information
     * @games MP3 and above
     */
    protected 0x03043051 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        this.titleId = r.readLookbackString();
        this.buildVersion = r.readString();
    };

    /**
     * (Skippable) Decoration height
     * @games MP3 and above
     */
    protected 0x03043052 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        this.decoBaseHeightOffset = r.readUInt32();
    };

    /**
     * (Skippable) Bot paths
     * @games MP3 and above
     */
    // protected 0x03043053 = ({ r }: Chunk) => {};

    /**
     * (Skippable) Embedded objects
     * @games MP3 and above
     */
    // protected 0x03043054 = ({ r }: Chunk) => {};

    /**
     * (Skippable) Light settings
     * @games MP4 and above
     */
    protected 0x03043056 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());
        f.readUnknown(r.readUInt32());

        this.dayTime = r.readUInt32();

        f.readUnknown(r.readUInt32());

        this.dynamicDaylight = r.readBoolean();
        this.dayDuration = r.readUInt32();
    };

    /**
     * (Skippable) SubMapsInfos
     * @games MP4 only
     */
    protected 0x03043058 = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readVersion(r.readUInt32());

        const u01 = f.readUnknown(r.readUInt32());

        if (u01 > 0)
            throw new Error("Unexpected value > 0 in chunk 0x03043058");
    };

    /**
     * (Skippable) World distortion
     * @games MP4 and above
     */
    protected 0x03043059 = ({ r }: Chunk, f: ChunkFunctions) => {
        const version = f.readVersion(r.readUInt32());

        this.worldDistortion = r.readVector3();

        if (version == 0) {
            throw new Error("Unexpected version 0 in chunk 0x03043059");
        }

        if (version >= 1) {
            const u01 = f.readUnknown(r.readBoolean());
            if (u01)
                throw new Error("Unexpected value true in chunk 0x03043059");
        }

        if (version >= 3) {
            f.readUnknown(r.readUInt32());
            f.readUnknown(r.readUInt32());
        }
    };

    /**
     * (Skippable)
     * @games TM2020 only
     */
    protected 0x0304305a = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readUInt32());
        f.readUnknown(r.readUInt32());
    };

    /**
     * (Skippable) Lightmaps
     * @games TM2020 only
     */
    // protected 0x0304305b = ({ r }: Chunk) => {};

    /**
     * (Skippable) Free blocks
     * @games TM2020 only
     */
    // protected 0x0304305f = ({ r }: Chunk) => {};

    /**
     * (Skippable) MapElemColor
     */
    // protected 0x03043062 = ({ r }: Chunk) => {};

    /**
     * (Skippable) AnimPhaseOffset
     * @games TM2020 only
     */
    // protected 0x03043063 = ({ r }: Chunk) => {};

    /**
     * (Skippable) Foreground pack desc
     * @games TM2020 only
     */
    // protected 0x03043065 = ({ r }: Chunk) => {};

    /**
     * (Skippable) MapElemLmQuality
     * @games TM2020 only
     */
    // protected 0x03043068 = ({ r }: Chunk) => {};

    /**
     * (Skippable) Macroblock instances
     * @games TM2020 only
     */
    // protected 0x03043069 = ({ r }: Chunk) => {};

    /**
     * (Skippable) Light settings (2)
     * @games TM2020 only
     */
    protected 0x0304306b = ({ r }: Chunk, f: ChunkFunctions) => {
        f.readUnknown(r.readUInt32());

        this.dayTime = r.readUInt32();

        f.readUnknown(r.readUInt32());

        this.dynamicDaylight = r.readBoolean();
        this.dayDuration = r.readUInt32();
    };

    protected 0x03043055 = ({ r }: Chunk, f: ChunkFunctions) => {
        const chunkVersion = f.readUnknown(r.readByte());
        this.unlimiter = -1;
        switch (chunkVersion) {
            case 1:
                this.unlimiter = 1.1;
                break;
            case 2:
                this.unlimiter = 1.2;
                break;
        }
        r.forceChunkSkip(0x03043055);
    };
    protected 0x3f001000 = ({ r }: Chunk, f: ChunkFunctions) => {
        this.unlimiter = 1.3;
        r.forceChunkSkip(0x3f001000);
    };

    protected 0x3f001001 = ({ r }: Chunk, f: ChunkFunctions) => {
        const trackVersion = f.readUnknown(r.readByte());
        this.unlimiter = -1;
        switch (trackVersion) {
            case 0:
                this.unlimiter = -1;
                break;
            case 1:
                this.unlimiter = 0.4;
                break;
            case 2:
                this.unlimiter = 0.6;
                break;
            case 3:
                this.unlimiter = 0.7;
                break;
            case 4:
                this.unlimiter = 1.1;
                break;
            case 5:
                this.unlimiter = 1.2;
                break;
            case 6:
                this.unlimiter = 1.3;
                break;
            case 7:
                this.unlimiter = 2.0;
                break;
        }
        r.forceChunkSkip(0x3f001001);
    };
    protected 0x3f001002 = ({ r }: Chunk, f: ChunkFunctions) => {
        this.unlimiter = 2.0;
        r.forceChunkSkip(0x3f001002);
    };
    protected 0x3f001003 = ({ r }: Chunk, f: ChunkFunctions) => {
        this.unlimiter = 2.0;
        r.forceChunkSkip(0x3f001003);
    };
}
