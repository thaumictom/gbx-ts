# gbx.js
[![GitHub](https://img.shields.io/github/license/ThaumicTom/gbx.js?style=for-the-badge)](https://github.com/ThaumicTom/gbx.js/blob/main/LICENSE)
[![GitHub file size in bytes](https://img.shields.io/github/size/ThaumicTom/gbx.js/src/gbx.min.js?style=for-the-badge)](#)
[![jsDelivr hits](https://img.shields.io/jsdelivr/npm/hm/gbx?color=ff5627&style=for-the-badge)](https://www.jsdelivr.com/package/npm/gbx)

a slim, fast and easy to set up Gamebox (GBX) parser written in vanilla JavaScript
- gbx.js parses the headers asynchronously, while it stays read-only
- supported versions range from Maniaplanet to Trackmania®
- currently only `*.Map.Gbx` and `*.Replay.Gbx` files are supported
- just 1.8kB minified and gzipped 

## Getting started

### Installing

Install via npm with `$ npm install gbx` and import it with `import GBX from 'gbx';`

Or instead include it in your HTML:
```javascript
<script src="https://cdn.jsdelivr.net/npm/gbx"></script>
```

### Basic usage

Create a new GBX instance, provide it with data either of a file type object or an Uint8Array and use the parsed data points after parsing.
```javascript
let myGBX = new GBX({
    data: buffer,
    onParse: function(metadata) {
        console.log(metadata)
    }
})
```

## Further reading

- [gbx.js Wiki](https://github.com/ThaumicTom/gbx.js/wiki)
    - [API](https://github.com/ThaumicTom/gbx.js/wiki/API)
    - [GBX Reference](https://github.com/ThaumicTom/gbx.js/wiki/GBX-Reference)
    - [Error handling](https://github.com/ThaumicTom/gbx.js/wiki/Error-handling)
    - [Examples](https://github.com/ThaumicTom/gbx.js/wiki/Examples)
- [gbx-net](https://github.com/BigBang1112/gbx-net), a more complete and more in-depth read & write GBX parser library written in C#
