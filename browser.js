const puppeteer = require('puppeteer');

async function startBrowser() {
    let browser;
    try {
        console.log("Starting the browser.......");
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });
    } catch (err) {
        console.log("Could not create a browser because  => : ", err);
    }
    return browser;
}

module.exports = {
    startBrowser
};