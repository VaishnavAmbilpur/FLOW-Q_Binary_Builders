const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'output.txt');
if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    // Try to decode as UTF-16LE
    const content = buffer.toString('utf16le');
    console.log("--- Content Start ---");
    console.log(content);
    console.log("--- Content End ---");
} else {
    console.log("File not found");
}
