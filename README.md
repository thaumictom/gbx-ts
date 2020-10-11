# gbx.js

[![GitHub](https://img.shields.io/github/license/ThaumicTom/gbx.js?style=for-the-badge)](https://github.com/ThaumicTom/gbx.js/blob/main/LICENSE)
[![GitHub file size in bytes](https://img.shields.io/github/size/ThaumicTom/gbx.js/src/gbx.min.js?style=for-the-badge)](#)

a slim - 1.7kB gzipped - ManiaPlanet-based map header parser based on vanilla and plain JavaScript

## Install

[Download](https://raw.githubusercontent.com/ThaumicTom/gbx.js/main/src/gbx.min.js) the minified javascript file and include it in your HTML:
```javascript
<script src="gbx.min.js"></script>
```

## Usage

Use `readGbx(file);` to read your mapfile. The type of the `file` has to be a Uint8Array.
```javascript
let file = new Uint8Array(/* readFile script */);;
readGbx(file);
```

After your file has been read, you can use the `metadata` object to obtain the header data from the mapfile.

## Examples

### Read a file from an input
To read a file from a simple input convert the target file from the input to a Uint8Array asynchronously.

```html
<input type="file" id="myfile">
```

```javascript
function readFile(file) {
    return new Promise((res, rej) => {
        let fr = new FileReader();
        fr.addEventListener("loadend", e => res(e.target.result));
        fr.addEventListener("error", rej);
        fr.readAsArrayBuffer(file);
    });
}

async function main(file) {
    let fileBuffer = new Uint8Array(await readFile(file));
    readGbx(fileBuffer);
}

document.querySelector("#myfile").addEventListener("change", e => {
    let file = e.target.files[0];
    main(file);
});

// Your result
console.log(metadata)
```

### Display thumbnail
To display the map thumbnail, first consider if there is any to not throw an error. Convert the Uint8Array to Base64 and include it in an image src for example. Note, that the map thumbnail is explicitly in jpg format.

```javascript
if(metadata.thumbnailSize > 0) {
    document.querySelector("img").src = "data:image/jpg;base64," + toBase64(metadata.thumbnail);
}
```
