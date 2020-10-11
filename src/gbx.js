/**
 * GBXjs - Version 2020-10-11
 * for ManiaPlanet-based maps only
 * 
 * by BigBang1112 & ThaumicTom
 * released under MIT license
 */

// Main

var gbx,
    version,
    format,
    refTableCompression,
    bodyCompression,
    unknown,
    classID,
    userDataSize,
    userData,
    numHeaderChunks;

var headerChunks = [];
var metadata = [];

var lookbackVersion = null;
var lookbackStrings = [];

var collectionIDs = {
    6: "Stadium",
    11: "Valley",
    12: "Canyon",
    13: "Lagoon",
    25: "Stadium256",
    26: "Stadium®",
    10003: "Common"
}

function readGbx(data) {
    buffer = data;

    // >>>>> Performance debug
    // var t0 = performance.now()

    lookbackVersion = null;
    lookbackStrings = [];

    gbx = readString(3);

    if(gbx == "GBX") {
        version = readInt16();

        if(version >= 3) {
            format = readChar();
            refTableCompression = readChar();
            bodyCompression = readChar();
            if(version >= 4) unknown = readChar();
            classID = readInt32();

            if(version >= 6) {
                userDataSize = readInt32();
                numHeaderChunks = readInt32();
                
                for(a = 0; a < numHeaderChunks; a++) {
                    var chunkId = readInt32() & 0xFFF;                    
                    var chunkSize = readInt32();
                    var isHeavy = (chunkSize & (1 << 31)) != 0;

                    headerChunks[chunkId] = {
                        size:       chunkSize & ~0x80000000,
                        isHeavy:    isHeavy
                    };
                }

                for (var key in headerChunks) {
                    headerChunks[key].data = readBytes(headerChunks[key].size);
                    delete headerChunks[key].size;
                }
            
                if(classID == 0x03043000) {
                    changeBuffer(headerChunks[0x002].data);

                    var chunk002Version = readByte();
                    if(chunk002Version < 3) {
                        metadata.mapInfo = readMeta();
                        metadata.mapName = readString();
                    }
                    readInt32();
                    if(chunk002Version >= 1) {
                        metadata.bronzeTime = readInt32();
                        metadata.silverTime = readInt32();
                        metadata.goldTime = readInt32();
                        metadata.authorTime = readInt32();
                        if(chunk002Version == 2)
                            readByte();
                        if(chunk002Version >= 4) {
                            metadata.cost = readInt32();
                            if(chunk002Version >= 5) {
                                metadata.isMultilap = readBool();
                                if(chunk002Version == 6)
                                    readBool();
                                if(chunk002Version >= 7) {
                                    metadata.trackType = readInt32();
                                    if(chunk002Version >= 9) {
                                        readInt32();
                                        if(chunk002Version >= 10) {
                                            metadata.authorScore = readInt32();
                                            if(chunk002Version >= 11) {
                                                metadata.editorMode = readInt32(); // bit 0: advanced/simple editor, bit 1: has ghost blocks
                                                if(chunk002Version >= 12) {
                                                    readBool();
                                                    if(chunk002Version >= 13) {
                                                        metadata.nbCheckpoints = readInt32();
                                                        metadata.nbLaps = readInt32();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    changeBuffer(headerChunks[0x003].data); // Change to 0x03043003 (Common)
                    
                    var chunk003Version = readByte();
                    metadata.mapInfo = readMeta();
                    metadata.mapName = readString();
                    var kind = readByte();
                    if (kind == 6) // Unvalidated map
                        console.error("[gbx.js] Unvalidated map.");
                    if (chunk003Version >= 1) {
                        metadata.locked = readBool(); // used by Virtual Skipper to lock the map parameters
                        metadata.password = readString(); // weak xor encryption, no longer used in newer track files; see 03043029
                        if (chunk003Version >= 2) {
                            metadata.decoration = readMeta();
                            if (chunk003Version >= 3) {
                                metadata.mapOrigin = readVec2();
                                if (chunk003Version >= 4) {
                                    metadata.mapTarget = readVec2();
                                    if (chunk003Version >= 5) {
                                        readInt64(); readInt64();
                                        if (chunk003Version >= 6) {
                                            metadata.mapType = readString();
                                            metadata.mapStyle = readString();
                                            if (chunk003Version <= 8)
                                                readBool();
                                            if (chunk003Version >= 8) {
                                                metadata.lightmapCacheUID = toBase64(readBytes(8));
                                                if (chunk003Version >= 9) {
                                                    metadata.lightmapVersion = readByte();
                                                    if (chunk003Version >= 11)
                                                        metadata.titleUID = readLookbackString();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    changeBuffer(headerChunks[0x005].data);

                    metadata.xml = readString();

                    changeBuffer(headerChunks[0x007].data);

                    var chunk007Version = readInt32();
                    if(chunk007Version != 0) {
                        metadata.thumbnailSize = readInt32();
                        readString("<Thumbnail.jpg>".length);
                        if(metadata.thumbnailSize == 0) {
                            metadata.thumbnail = null;
                            console.warn("[gbx.js] No thumbnail.");
                        }
                        else {
                            metadata.thumbnail = readBytes(metadata.thumbnailSizethumbSize);
                        }
                        readString("</Thumbnail.jpg>".length);
                        readString("<Comments>".length);
                        metadata.comments = readString();
                        readString("</Comments>".length);
                    }

                    changeBuffer(headerChunks[0x008].data);

                    var chunk008Version = readInt32();
                    metadata.authorVersion = readInt32();
                    metadata.authorLogin = readString();
                    metadata.authorNickname = readString();
                    metadata.authorZone = readString();
                    metadata.authorExtraInfo = readString();
                }
                else if(classID == 0x03093000) { // Replay
                    changeBuffer(headerChunks[0x000].data);

                    chunk000Version = readInt32();
                    if(chunk000Version >= 2)
                    {
                        metadata.mapInfo = readMeta();
                        metadata.time = readInt32();
                        metadata.driverNickname = readString();

                        if (chunk000Version >= 6)
                        {
                            metadata.driverLogin = readString();

                            if (chunk000Version >= 8)
                            {
                                readByte();
                                metadata.titleUID = readLookbackString();
                            }
                        }
                    }

                    changeBuffer(headerChunks[0x001].data);

                    metadata.xml = readString();

                    changeBuffer(headerChunks[0x002].data);

                    var chunk002Version = readInt32();
                    metadata.authorVersion = readInt32();
                    metadata.authorLogin = readString();
                    metadata.authorNickname = readString();
                    metadata.authorZone = readString();
                    metadata.authorExtraInfo = readString();
                }
                else console.error("[gbx.js] Error parsing: Not a map or replay file.");
            }
        }
    }

    // >>>>> Performance debug
    // var t1 = performance.now()
    // console.log("[gbx.net] Event handeled in " + (t1 - t0) + " milliseconds.")
}

// Functions

var buffer;
var pointer = 0;
var previousPointerPos = 0;
var utf8decoder = new TextDecoder();

function changeBuffer(newBuffer) {
    buffer = newBuffer;
    previousPointerPos = pointer;
    pointer = 0;
}

function peekByte() {
    return buffer[pointer];
}

function peekBytes(count) {
    var bytes = new Uint8Array(count);
    for (i = 0; i < count; i++)
        bytes[i] = buffer[pointer + i];
    return bytes;
}

function readByte() {
    var byte = peekByte();
    pointer += 1;
    return byte;
}

function readBytes(count) {
    var bytes = new Uint8Array(count);
    for (i = 0; i < count; i++)
        bytes[i] = readByte();
    return bytes;
}

function readInt16() {
    var bytes = readBytes(2);
    return bytes[0] | (bytes[1] << 8);
}

function readInt32() {
    var bytes = readBytes(4);
    return bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
}

function readInt64() {
    var bytes = readBytes(8);
    return bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24) |
        (bytes[4] << 32) | (bytes[5] << 40) | (bytes[6] << 48) | (bytes[7] << 56);
}

function readString(count) {
    if (count == undefined) count = readInt32();
    return utf8decoder.decode(readBytes(count));
}

function readChar() {
    return readString(1);
}

function readLookbackString() {
    if (lookbackVersion == null)
        lookbackVersion = readInt32();

    var index = new Uint32Array([readInt32()])[0];

    if ((index & 0x3FFF) == 0 && (index >> 30 == 1 || index >> 30 == -2))
    {
        var str = readString();
        lookbackStrings.push(str);
        return str;
    } else if ((index & 0x3FFF) == 0x3FFF) {
        switch (index >> 30) {
            case 2:
                return "Unassigned";
            case 3:
                return "";
            default:
                console.error("[gbx.js] Error parsing: Unknown lookback error.");
        }
    } else if (index >> 30 == 0) {
        if (collectionIDs[index] == undefined) {
            console.warn("[gbx.js] Unknown index: " + index);
            return index;
        } else
            return collectionIDs[index];
    } else if (lookbackStrings.Count > (index & 0x3FFF) - 1)
        return lookbackStrings[(index & 0x3FFF) - 1];
    else
        return "";
}

function readMeta() {
    return {
        id: readLookbackString(),
        collection: readLookbackString(),
        author: readLookbackString()
    };
}

function readBool() {
    return !!readInt32();
}

function readFloat() {
    return readInt32().toFixed(2);
}

function readVec2() {
    return {
        x: readFloat(),
        y: readFloat()
    };
}

function readVec3() {
    return {
        x: readFloat(),
        y: readFloat(),
        z: readFloat()
    };
}

function toHex(input) {
    return input.toString(16);
}

function toBase64(data) {
    return btoa([].reduce.call(new Uint8Array(data),
        function (p, c) {
            return p + String.fromCharCode(c)
        }, ''));
}
