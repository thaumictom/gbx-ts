# gbx.js

[![GitHub](https://img.shields.io/github/license/ThaumicTom/gbx.js?style=for-the-badge)](https://github.com/ThaumicTom/gbx.js/blob/main/LICENSE)
[![GitHub file size in bytes](https://img.shields.io/github/size/ThaumicTom/gbx.js/src/gbx.min.js?style=for-the-badge)](#)

a slim - 1.7kB gzipped - ManiaPlanet-based map header parser based on vanilla and plain JavaScript

## Getting started

### Installing

Install via npm with `$ npm install gbx` and import it with `import GBX from 'gbx';`

Or instead include it in your HTML:
```javascript
<script src="https://cdn.jsdelivr.net/npm/gbx"></script>
```

### Basic usage

Use `readGbx(file);` to read your mapfile. The type of the `file` has to be a Uint8Array.
```javascript
let buffer = new Uint8Array(/* Your *.Gbx file byte data */);
let GBX = new GBX({
    data: buffer,
    onParse: function(e) {
        console.log(e);
    }
});
```

### Examples and advanced options

- [Examples](https://github.com/ThaumicTom/gbx.js/wiki/Examples)
- [API](https://github.com/ThaumicTom/gbx.js/wiki/API)