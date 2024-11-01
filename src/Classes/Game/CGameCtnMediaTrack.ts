import CGameCtnMediaBlock from "./CGameCtnMediaBlock";
import CGameCtnMediaBlockTriangles from "./CGameCtnMediaBlockTriangles";

/**
 * @chunk 0x03078000
 */
export default class CGameCtnMediaTrack {
  public name?: string;
  public blocks?: any[];
  public keepPlaying?: boolean;

  protected 0x03078001 = ({ r }: Chunk) => {
    this.blocks = [];
    const name = r.readString();
    r.readUInt32();
    const nbBlocks = r.readUInt32();

    for (let i = 0; i < nbBlocks; i++) {
      const block = r.readNodeReference(); // CGameCtnMediaBlock

      this.blocks.push(block);
    }

    const u01 = r.readUInt32();
  };

  protected 0x03078004 = ({ r }: Chunk) => {
    this.keepPlaying = r.readBoolean();
    r.readUInt32();
  };
}
