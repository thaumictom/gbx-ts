import Node from "../Node";
import CGameCtnMediaBlock from "./CGameCtnMediaBlock";

/**
 * @chunk 0x03029000
 */
export default class CGameCtnMediaBlockTriangles {
    protected 0x03029001 = ({ r }: Chunk) => {
        let numKeys = r.readUInt32();
        let timeStamps: number[] = [];

        for (let x = 0; x < numKeys; x++) {
            timeStamps.push(r.readFloat());
        }

        numKeys = r.readUInt32();
        let numPoints = r.readUInt32();
        for (let x = 0; x < numKeys; x++) {
            for (let y = 0; y < numPoints; y++) {
                const position = r.readVector3();
            }
        }

        numPoints = r.readUInt32();
        for (let y = 0; y < numPoints; y++) {
            const color = r.readVector3();
            const opacity = r.readFloat();
        }

        const numTriangle = r.readUInt32();
        for (let x = 0; x < numTriangle; x++) {
            let v1 = r.readUInt32();
            let v2 = r.readUInt32();
            let v3 = r.readUInt32();
        }
        r.readUInt32(); // ignored
        r.readUInt32(); // ignored
        r.readUInt32(); // ignored
        r.readFloat(); // ignored
        r.readUInt32(); // ignored
        // read Uint64
        r.readNumbers(8) // ignored

    };
}
