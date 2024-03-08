# gbx-ts

a slim, fast and easy to set up Gamebox (GBX) parser written in TypeScript

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
import { GBX } from 'gbx';

const gbx = await new GBX({ path: 'path/to/file.Map.Gbx' }).parse();

console.log(gbx);
```

## License

- gbx.js is licensed under the MIT License.
- Processing the body of GBX files requires the use of the optional dependency [lzo-ts](https://github.com/thaumictom/lzo-ts), which is licensed under the GPL-3.0 License.

## Alternative libraries

- [gbx-net](https://github.com/BigBang1112/gbx-net), a complete and in-depth read & write GBX parser library written in C#.
- [ManiaPlanetSharp](https://github.com/stefan-baumann/ManiaPlanetSharp), a GBX parser library and viewer written in C#.
- [pygbx](https://github.com/donadigo/pygbx), a GBX parser library written in Python.
