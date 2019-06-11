//TODO: Add unit test for file grabbing code. 
const aws = require('aws-sdk');

async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
        
    process.stdout.write('      ');
    for(i = 0; i < sites.length; i++){
        process.stdout.write(`Site ${i}... `);
        try { 
        await page.goto(sites[i]);
        } catch (error) {
        console.error(error);
        return false;
        }
    }

    event.Records.forEach((record) => {
        const filename = record.s3.object.key;
        const filesize = record.s3.object.size;
        console.log(`New .png object has been created: ${filename} (${filesize} bytes)`);
    });

    s3.putObject({
    Bucket: process.env.BUCKET,
    Key: event.key,
    Body: buffer,
    }).promise();

    console.log();

    await browser.close();

    return true;
}();