
const fs = require('fs');
const jsonExport = require('./combineJson.js');
const dataEvaluation = require('./evaluateData.js')
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4889.0 Safari/537.36"


const scraperObject = {
    url: 'https://www.bestbuy.com/site/computer-accessories/hard-drives/abcat0504001.c?id=abcat0504001',
    async scraper(browser){
        //initializes the page
        let page = await browser.newPage();
        console.log('Navigating to ' + this.url);
        page.setUserAgent(userAgent);
        //let user = await browser.userAgent()
        //console.log(user);
        //navigates to the hard coded url (the section of the BB site we want to navigate)
        await page.goto(this.url);
        //waits until the page content we want to look through is loaded completely
        await page.waitForSelector('.pl-page-content');

        let counter = 0;

        //begins the loop until we run out of pages to go through
        nextPageLoop:
        while(true){
            //counting the number of times it goes through the process
            counter++;
            console.log(counter);

            //this finds the sku header object in the BB site architechture, which links us to the product page
            let urls = await page.$$eval('.sku-header > a', links => links.map(n => n.getAttribute('href')));

            //waits for the main section of the page to load before doing anything
            await page.waitForSelector('.pl-page-content');

            //loops through the products on the current page
            for(let i = 0; i < urls.length; i++){

                //create a new page to open our product in
                let tempPage;

                let attempts = 0;
                let maxAttempts = 3;

                while(true) {
                    try {
                        tempPage = await browser.newPage();
                        break;
                    } catch (error) {
                        console.log("Couldn't create a new page because => ", err);

                        if(++attempts === maxAttempts){
                            throw error
                        }else {
                            console.log("...Trying Again...");
                        }
                    }
                }
                
                tempPage.setUserAgent(userAgent);

                //reconstruct our full url
                let tempURL = 'https://www.bestbuy.com' + urls[i];
                
                //wait for page to load
                await tempPage.goto(tempURL);
                await tempPage.waitForSelector('.pl-page-content');

                //grab the product name
                try {
                    var productName = await tempPage.$eval(   
                        'div.sku-title > h1', value => value.textContent)
                    console.log(productName);

                } catch (error) {
                    console.log(error);
                }

                //check to see if the Model is on the page (extract data here)
                try {
                    var modelData = await tempPage.$eval(   
                        'div.model > .product-data-value.body-copy', value => value.textContent)
                    console.log(modelData);
                } catch (error) {
                    console.log("No Model Data Provided");
                    var modelData = null;
                }

                //check to see if the SKU is on the page (extract data here)
                try {
                    var sku = await tempPage.$eval(   
                        'div.sku > .product-data-value.body-copy', value => value.textContent)
                    console.log(sku);
                } catch (error) {
                    console.log("No SKU Provided");
                    var sku = null;
                }

                //check to see if the price is on the page (extract data here)
                try {
                    var currentPrice = await tempPage.$eval(   
                        'div.priceView-customer-price > span', value => value.textContent)
                    console.log(currentPrice);
                } catch (error) {
                    console.log("No Price provided");
                }
                //checks to see if the previous price is on the page (extracts data here)
                try {
                    console.log(await tempPage.$eval(   
                        'div.pricing-price__regular-price', value => value.textContent));
                } catch (error) {
                    console.log("No previous price");
                }
                //clicks on the specifications tab on the page to open section (extract data here)
                try{
                    //wait for the button to be loaded into the DOM
                    await tempPage.waitForSelector('.shop-specifications > div > div > div > div > button');
                    //click once to navigate us to the location of the page
                    await tempPage.click('.shop-specifications > div > div > div > div > button', {delay: 1000, clickCount: 1});
                    //wait for the carousel to load properly before trying to click again
                    await tempPage.waitForSelector('ul.child-items > li');
                    //now the button location has settled, we can finally click the button
                    await tempPage.click('.shop-specifications > div > div > div > div > button', {delay: 100, clickCount: 1});
                    //wait for the specifications section to load completely before we take the info
                    try{
                        await tempPage.waitForSelector('.c-accordion-content.c-accordion-content-active.c-accordion-content-complete', {timeout: 10000});
                    } catch(error){
                        await tempPage.click('.shop-specifications > div > div > div > div > button', {delay: 100, clickCount: 1});
                        await tempPage.waitForSelector('.c-accordion-content.c-accordion-content-active.c-accordion-content-complete', {timeout: 10000});
                    }
                    
                    await tempPage.waitForSelector('ul.specifications-list > li > div.row-value');
                    
                    
                    //categories
                    let categories = await tempPage.$$eval( 'ul.specifications-list > li > div.title-container', val => val.map(value=>value.textContent));
                    //console.log(categories);

                    
                    //specs
                    let specs = await tempPage.$$eval(   
                        'ul.specifications-list > li > div.row-value', values => values.map(value=>value.textContent));
                    //console.log(specs);
                    
                    
                    for(let i=0; i < categories.length; i++) {
                        if(categories[i][0] === ' '){
                            categories[i] = categories[i].substring(1, categories[i].length - 1);
                        }
                    }
                    //console.log(categories);
                    
                    

                    if(sku != null){

                        let dataObject = {price: currentPrice, url: tempURL};

                        for(let i = 0; i < categories.length; i++) {
                            let title = categories[i];
                            dataObject = {...dataObject, [title]: specs[i]};
                        }
    
                        let filePath = "./drives/" + sku.substring(0, sku.length - 1) + ".json";
                        
                        let JSONSpecs = JSON.stringify(dataObject, null, 2);
    
                        fs.writeFile(filePath, JSONSpecs, (err) => {
                            if (err) console.log(err); 
                            else console.log('wrote the data!')
                        });
                    }
                    

                } catch (error) {
                    console.log(error);
                }
                
                
                //close that page
                await tempPage.close();
            }


            //construct url for next page
            let nextPage = await page.$eval('.sku-list-page-next', value => value.getAttribute('href'));
            console.log(`Next page: ${nextPage}`);
            //check to see if there is a next page
            if(nextPage != null){
                let nextURL = 'https://www.bestbuy.com' + nextPage;
                await page.goto(nextURL);
            }else{
                // exit the loop
                break nextPageLoop;
            }
        }
        
        await page.close();
        await jsonExport.compileJSONFiles("accumulatedContent.json");
        dataEvaluation.cullDrives();
    }
}

const delay = (n) => new Promise( r => setTimeout(r, n*1000));

module.exports = scraperObject;