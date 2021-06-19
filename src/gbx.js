/**
 * GBXjs - Version 2021-06-20
 *
 * by BigBang1112 & ThaumicTom
 * released under MIT license
 */
(function (f) {
    'use strict';
    var name = 'GBX';
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = f.apply(
            null,
            [].map(function (r) {
                return require(r);
            })
        );
    } else if (typeof define === 'function' && define.amd) {
        define([], f);
    } else {
        var g;
        if (typeof window !== 'undefined') {
            g = window;
        } else if (typeof global !== 'undefined') {
            g = global;
        } else if (typeof self !== 'undefined') {
            g = self;
        } else {
            g = this;
        }
        g[name] = f.apply(
            null,
            [].map(function (r) {
                return g[r];
            })
        );
    }
})(function () {
    // Main

    var gbx,
        version,
        format,
        refTableCompression,
        bodyCompression,
        unknown,
        classID,
        userDataSize,
        numHeaderChunks,
        byte,
        bytes,
        buffer,
        err,
        pointer,
        lookbackVersion,
        metadata;

    var headerChunks = [];
    var lookbackStrings = [];

    var utf8decoder = new TextDecoder();

    var collectionIDs = {
        6: 'Stadium',
        11: 'Valley',
        12: 'Canyon',
        13: 'Lagoon',
        25: 'Stadium256',
        26: 'Stadium®',
        10003: 'Common',
    };

    GBX.prototype.read = function () {
        var t0 = performance.now();

        metadata = [];

        pointer = 0;
        lookbackVersion = null;

        buffer = this.buffer;

        gbx = readString(3);

        if (gbx == 'GBX') {
            version = readInt16();

            if (version >= 3) {
                format = readChar();
                refTableCompression = readChar();
                bodyCompression = readChar();
                if (version >= 4) unknown = readChar();
                classID = readInt32();

                if (version >= 6) {
                    userDataSize = readInt32();
                    if (userDataSize > 0) {
                        numHeaderChunks = readInt32();

                        for (a = 0; a < numHeaderChunks; a++) {
                            var chunkId = readInt32() & 0xfff;
                            var chunkSize = readInt32();
                            var isHeavy = (chunkSize & (1 << 31)) != 0;

                            headerChunks[chunkId] = {
                                size: chunkSize & ~0x80000000,
                                isHeavy: isHeavy,
                            };
                        }

                        for (var key in headerChunks) {
                            headerChunks[key].data = readBytes(
                                headerChunks[key].size
                            );
                            delete headerChunks[key].size;
                        }

                        if (classID == 0x03043000) {
                            changeBuffer(headerChunks[0x002].data);

                            var chunk002Version = readByte();
                            if (chunk002Version < 3) {
                                metadata.mapInfo = readMeta();
                                metadata.mapName = readString();
                            }
                            readInt32();
                            if (chunk002Version >= 1) {
                                metadata.bronzeTime = readInt32();
                                metadata.silverTime = readInt32();
                                metadata.goldTime = readInt32();
                                metadata.authorTime = readInt32();
                                if (chunk002Version == 2) readByte();
                                if (chunk002Version >= 4) {
                                    metadata.cost = readInt32();
                                    if (chunk002Version >= 5) {
                                        metadata.isMultilap = readBool();
                                        if (chunk002Version == 6) readBool();
                                        if (chunk002Version >= 7) {
                                            metadata.trackType = readInt32();
                                            if (chunk002Version >= 9) {
                                                readInt32();
                                                if (chunk002Version >= 10) {
                                                    metadata.authorScore =
                                                        readInt32();
                                                    if (chunk002Version >= 11) {
                                                        metadata.editorMode =
                                                            readInt32(); // bit 0: advanced/simple editor, bit 1: has ghost blocks
                                                        metadata.isSimple =
                                                            (metadata.editorMode &
                                                                1) !=
                                                            0;
                                                        metadata.hasGhostBlocks =
                                                            (metadata.editorMode &
                                                                2) !=
                                                            0;
                                                        if (
                                                            chunk002Version >=
                                                            12
                                                        ) {
                                                            readBool();
                                                            if (
                                                                chunk002Version >=
                                                                13
                                                            ) {
                                                                metadata.nbCheckpoints =
                                                                    readInt32();
                                                                metadata.nbLaps =
                                                                    readInt32();
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
                            metadata.mapNameD = deformat(metadata.mapName);
                            var kind = readByte();
                            if (kind == 6)
                                // Unvalidated map
                                err = 3;
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
                                                readInt64();
                                                readInt64();
                                                if (chunk003Version >= 6) {
                                                    metadata.mapType =
                                                        readString();
                                                    metadata.mapStyle =
                                                        readString();
                                                    if (chunk003Version <= 8)
                                                        readBool();
                                                    if (chunk003Version >= 8) {
                                                        metadata.lightmapCacheUID =
                                                            toBase64(
                                                                readBytes(8)
                                                            );
                                                        if (
                                                            chunk003Version >= 9
                                                        ) {
                                                            metadata.lightmapVersion =
                                                                readByte();
                                                            if (
                                                                chunk003Version >=
                                                                11
                                                            )
                                                                metadata.titleUID =
                                                                    readLookbackString();
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            metadata.game = getGameByTitleUID(
                                metadata.titleUID
                            );

                            changeBuffer(headerChunks[0x005].data);

                            metadata.xml = readString();

                            if (chunk003Version > 5) {
                                changeBuffer(headerChunks[0x008].data);

                                /*var chunk008Version =*/
                                readInt32();
                                metadata.authorVersion = readInt32();
                                metadata.authorLogin = readString();
                                metadata.authorNickname = readString();
                                metadata.authorZone = readString();
                                metadata.authorExtraInfo = readString();
                            }
                        } else if (classID == 0x03093000) {
                            // Replay

                            changeBuffer(headerChunks[0x000].data);

                            chunk000Version = readInt32();
                            if (chunk000Version >= 2) {
                                metadata.mapInfo = readMeta();
                                metadata.time = readInt32();
                                metadata.driverNickname = readString();

                                if (chunk000Version >= 6) {
                                    metadata.driverLogin = readString();

                                    if (chunk000Version >= 8) {
                                        readByte();
                                        metadata.titleUID =
                                            readLookbackString();
                                    }
                                }
                            }

                            metadata.game = getGameByTitleUID(
                                metadata.titleUID
                            );

                            changeBuffer(headerChunks[0x001].data);

                            metadata.xml = readString();

                            changeBuffer(headerChunks[0x002].data);

                            var chunk002Version = readInt32();
                            metadata.authorVersion = readInt32();
                            metadata.authorLogin = readString();
                            metadata.authorNickname = readString();
                            metadata.authorZone = readString();
                            metadata.authorExtraInfo = readString();
                        } else err = 2;
                    }
                }
            }
        } else err = 1;

        if (this.onParse !== undefined && this.onParse.length > 0) {
            this.onParse(metadata, err, t1 - t0);
        }

        // Thumbnail

        if (this.thumb) {
            changeBuffer(headerChunks[0x007].data);

            var chunk007Version = readInt32();
            if (chunk007Version != 0) {
                metadata.thumbnailSize = readInt32();
                a;
                readString('<Thumbnail.jpg>'.length);
                if (metadata.thumbnailSize == 0) {
                    metadata.thumbnail = null;
                } else {
                    metadata.thumbnail = readBytes(metadata.thumbnailSize);
                }
                readString('</Thumbnail.jpg>'.length);
                readString('<Comments>'.length);
                metadata.comments = readString();
                readString('</Comments>'.length);
            }

            if (this.thumb == 'base64') {
                metadata.thumbnail = toBase64(metadata.thumbnail);
            }
        }

        if (this.onThumb !== undefined && this.onThumb.length > 0) {
            this.onThumb(metadata.thumbnail, metadata.thumbnailSize);
        }

        var t1 = performance.now();
    };

    // Process options; Starting point

    function GBX(data) {
        f = this.read;

        if (data['data'].constructor !== Uint8Array) {
            (async function () {
                data['data'] = new Uint8Array(await readFile(data['data']));
                optionProcess(data, f);
            })();
        } else {
            optionProcess(data, f);
        }
    }

    // Functions

    function optionProcess(data, f) {
        if (data['thumbnail']) {
            this.thumb = data['thumbnail'];
        }

        this.onParse = data['onParse'];
        this.onThumb = data['onThumb'];
        this.buffer = data['data'];

        if (this.buffer !== undefined) {
            f(this.buffer);
        } else {
            err = 0;
        }
    }

    function readFile(file) {
        return new Promise((res, rej) => {
            let fr = new FileReader();
            fr.addEventListener('loadend', (e) => res(e.target.result));
            fr.addEventListener('error', rej);
            fr.readAsArrayBuffer(file);
        });
    }

    function changeBuffer(newBuffer) {
        buffer = newBuffer;
        //var previousPointerPos = pointer;
        pointer = 0;
    }

    function peekByte() {
        return buffer[pointer];
    }

    /* Testing function
    
    function peekBytes(count) {
        var bytes = new Uint8Array(count);
        for (i = 0; i < count; i++)
            bytes[i] = buffer[pointer + i];
        return bytes;
    }
    */

    function readByte() {
        byte = peekByte();
        pointer += 1;
        return byte;
    }

    function readBytes(count) {
        bytes = new Uint8Array(count);
        for (i = 0; i < count; i++) bytes[i] = readByte();
        return bytes;
    }

    function readInt16() {
        bytes = readBytes(2);
        return bytes[0] | (bytes[1] << 8);
    }

    function readInt32() {
        bytes = readBytes(4);
        return bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    }

    function readInt64() {
        bytes = readBytes(8);
        return (
            bytes[0] |
            (bytes[1] << 8) |
            (bytes[2] << 16) |
            (bytes[3] << 24) |
            (bytes[4] << 32) |
            (bytes[5] << 40) |
            (bytes[6] << 48) |
            (bytes[7] << 56)
        );
    }

    function readString(count) {
        if (count == undefined) count = readInt32();
        return utf8decoder.decode(readBytes(count));
    }

    function readChar() {
        return readString(1);
    }

    function readLookbackString() {
        if (lookbackVersion == null) lookbackVersion = readInt32();

        var index = new Uint32Array([readInt32()])[0];

        if ((index & 0x3fff) == 0 && (index >> 30 == 1 || index >> 30 == -2)) {
            var str = readString();
            lookbackStrings.push(str);
            return str;
        } else if ((index & 0x3fff) == 0x3fff) {
            switch (index >> 30) {
                case 2:
                    return 'Unassigned';
                case 3:
                    return '';
                default:
                    err = 10;
            }
        } else if (index >> 30 == 0) {
            if (collectionIDs[index] == undefined) {
                err = 4;
                return index;
            } else return collectionIDs[index];
        } else if (lookbackStrings.Count > (index & 0x3fff) - 1)
            return lookbackStrings[(index & 0x3fff) - 1];
        else return '';
    }

    function readMeta() {
        return {
            id: readLookbackString(),
            collection: readLookbackString(),
            author: readLookbackString(),
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
            y: readFloat(),
        };
    }

    function toBase64(data) {
        return btoa(
            new Uint8Array(data).reduce(function (data, byte) {
                return data + String.fromCharCode(byte);
            }, '')
        );
    }

    function deformat(str) {
        return str
            .replace(/\$\$/g, '$\\')
            .replace(
                /\$([a-f0-9]){3}|\$([a-f0-9]){1,2}(?=[^a-f0-9])|\$([lh]\[.*?\]|[g-il-ostwz])/gi,
                ''
            )
            .replace(/\$\\/, '$');
    }

    function getGameByTitleUID(title) {
        if (title == 'Trackmania') {
            return 'Trackmania®';
        } else if (title == 'TMCE@nadeolabs' || title == 'TMTurbo@nadeolabs') {
            return 'Trackmania Turbo';
        } else {
            return 'ManiaPlanet';
        }
    }

    return GBX;
});
