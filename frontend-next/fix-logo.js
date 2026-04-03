const Jimp = require('jimp');

async function fixLogo(inFile, outFile) {
    try {
        const image = await Jimp.read(inFile);
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        console.log(`Processing ${inFile}, size: ${w}x${h}`);

        let minX = w, minY = h, maxX = 0, maxY = 0;

        // Scan the image to find the bounding box of the logo elements.
        // The logo is deep blue or dark text.
        // We look for pixels where (b > 100 and r < 120 and g < 150) [Blue] 
        // OR (r < 80 and g < 80 and b < 100) [Dark Text]
        image.scan(0, 0, w, h, function (x, y, idx) {
            let r = this.bitmap.data[idx];
            let g = this.bitmap.data[idx + 1];
            let b = this.bitmap.data[idx + 2];

            let isBlue = (b > 100 && r < 120 && g < 150);
            let isDark = (r < 80 && g < 80 && b < 100);

            if (isBlue || isDark) {
                // Ignore the blue square in the background which is in the top right.
                // Assuming the logo is roughly in the center, we constrain the search.
                if (x > w * 0.1 && x < w * 0.9 && y > h * 0.1 && y < h * 0.9) {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }
        });

        console.log(`Bounding box: ${minX}, ${minY} to ${maxX}, ${maxY}`);
        if (minX > maxX || minY > maxY) {
            console.log('Could not find logo. Saving original.');
            return image.writeAsync(outFile);
        }

        // Add a small margin
        let margin = 10;
        minX = Math.max(0, minX - margin);
        minY = Math.max(0, minY - margin);
        maxX = Math.min(w, maxX + margin);
        maxY = Math.min(h, maxY + margin);

        // Crop the image
        image.crop(minX, minY, maxX - minX, maxY - minY);

        // Make background transparent (everything close to white)
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            let r = this.bitmap.data[idx];
            let g = this.bitmap.data[idx + 1];
            let b = this.bitmap.data[idx + 2];
            // If pixel is light/white
            if (r > 200 && g > 200 && b > 200) {
                this.bitmap.data[idx + 3] = 0; // alpha = 0
            }
        });

        await image.writeAsync(outFile);
        console.log(`Saved ${outFile}`);
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await fixLogo('public/bright-extracted.png', 'public/bright-fixed.png');
    await fixLogo('public/dark-extracted.png', 'public/dark-fixed.png');
}

run();
