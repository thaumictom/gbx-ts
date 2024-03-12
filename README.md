# gbx-ts

a slim, fast and easy to set up read-only Gamebox (GBX) parser written in TypeScript

## Installation

Install the package using your desired package manager.

gbx-ts is fully compatible with yarn, pnpm, deno and bun.

```
npm install gbx
```

Additionally, if you plan to process the body of GBX files, you will need to install the optional dependency [lzo-ts](https://github.com/thaumictom/lzo-ts). Please note that lzo-ts is licensed under the GPL-3.0 License.

```
npm install lzo-ts
```

## Usage

```ts
import { GBX, CGameCtnChallenge } from 'gbx';

const gbx = await new GBX<CGameCtnChallenge>({ path: 'path/to/file.Map.Gbx' }).parse();

console.log(gbx);
```

You can then use code completion (IntelliSense) to explore the properties of the parsed GBX file.

## Limitations

gbx-ts

- is read-only, meaning it can only parse GBX files and not write them.
- does not support all GBX file types, only the ones that have been implemented so far.
- tries to read all chunks of each class, but there might be some unknown, although skippable, chunks. An exception are any form of MediaTracker data, as it is not yet implemented. gbx-ts will try to force skip these.

Please refer to [alternative libraries](#alternative-libraries) if you need a more complete solution.

### Supported GBX file types

| Class                                                        | File extension            |
| ------------------------------------------------------------ | ------------------------- |
| [CGameCtnChallenge](/src/Classes/CGameCtnChallenge.ts)       | .Map.Gbx / .Challenge.Gbx |
| [CGameCtnReplayRecord](/src/Classes/CGameCtnReplayRecord.ts) | .Replay.Gbx               |
| [CGameCtnGhost](/src/Classes/CGameCtnGhost.ts)               | .Ghost.Gbx                |

## License

- gbx.js is licensed under the MIT License.
- Processing the body of GBX files requires the use of the optional dependency [lzo-ts](https://github.com/thaumictom/lzo-ts), which is licensed under the GPL-3.0 License.

## Credits

Special thanks to [BigBang1112](https://github.com/BigBang1112) for explaining his work on [gbx-net](https://github.com/BigBang1112/gbx-net), which was a great help in understanding the GBX file format, and giving me advice on how to improve the library.

### Alternative libraries

- [gbx-net](https://github.com/BigBang1112/gbx-net), a complete and in-depth read & write GBX parser library written in C#.
- [ManiaPlanetSharp](https://github.com/stefan-baumann/ManiaPlanetSharp), a GBX parser library and viewer written in C#.
- [pygbx](https://github.com/donadigo/pygbx), a GBX parser library written in Python.
