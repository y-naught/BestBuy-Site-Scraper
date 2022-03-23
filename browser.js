const puppeteer = require('puppeteer');


async function startBrowser() {
    let browser;
    let maxTries = 3;
    let tries = 0;

    while(true){
        try {
            console.log("Starting the browser.......");
            browser = await puppeteer.launch({
                //uncomment linke below if you are running on a linux VM
                //you will also need to install a chromium-browser separately using
                //apt-get install chromium-browser
                //executablePath: '/usr/bin/chromium-browser',
                headless: true,
                args: ["--no-sandbox","--disable-setuid-sandbox"],
                'ignoreHTTPSErrors': true
            });
            
        } catch (err) {
            console.log("Could not create a browser because  => : ", err);
            
            if(++tries === maxTries) {
                throw err;
            }else {
                console.log("...Trying again...");
            }
        }
        console.log(browser);
        return browser;
    }
}

module.exports = {
    startBrowser
};