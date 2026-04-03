const fs = require('fs');

function extractBase64(svgFile, outFile) {
    const content = fs.readFileSync(svgFile, 'utf8');
    const startStr = 'base64,';
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) {
        console.log(`No base64 found in ${svgFile}`);
        return;
    }
    const endIdx = content.indexOf('"', startIdx + startStr.length);
    const base64Data = content.substring(startIdx + startStr.length, endIdx);
    fs.writeFileSync(outFile, Buffer.from(base64Data, 'base64'));
    console.log(`Extracted ${outFile}`);
}

extractBase64('public/bright-mode.svg', 'public/bright-extracted.png');
extractBase64('public/dark-mode.svg', 'public/dark-extracted.png');
