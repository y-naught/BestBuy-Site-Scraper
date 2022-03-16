const fs = require('fs');
const filePath = __dirname + "/accumulated.json";

const searchJSON = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if(err) {
                reject(err)
            }
            resolve(data);
        });
    });
}

const categorizeDrives = (drives) => {
    let counter = 0;
    let HDDCount = 0;
    let HDDs = [];
    let SSDCount = 0;
    let SSDs = [];

    return new Promise((resolve, reject) => {
        drives.forEach((drive) => {
            let driveType = drive["Storage Drive Type"];
            console.log(driveType);
            if(driveType === "HDD"){
                HDDCount++;
                HDDs.push(drive);
            }
            else if(driveType === "SSD"){
                SSDCount++;
                SSDs.push(drive);
            }
            counter++;
            if(counter === drives.length){

                let sortedDrives = sortDrives(HDDs);

                let importantDrives = [HDDs, SSDs];
                console.log(`HDDs: ${HDDCount}, SSDs: ${SSDCount}`);
                
                resolve(sortedDrives);
            }else if(counter > drives.length){
                reject("ya done messed up");
            }
        })
    })
}

const cullDrives = async () => {
    searchJSON(filePath)
    .then(rawDrives => JSON.parse(rawDrives))
    .then(drives => categorizeDrives(drives))
    .then(jsonDrives => JSON.stringify(jsonDrives, null, 2))
    .then(data => {
        fs.writeFile(`${__dirname}/sortedDrives.json`, data, (err) =>{
            if(err) {
                console.log(err);
            }
        });
    })
    .catch(err => console.log(err));
}

const sortDrives = (drives) => {
    const pricesPerTB = [];

    return new Promise((resolve) => {
        drives.forEach((drive) => {
            let capacityRaw = drive["Storage Capacity"];
            console.log(capacityRaw);
            if(capacityRaw != undefined){
                let capacity = capacityRaw.split(" ");
                let capacityTB = capacity[0]/1000;
                let priceRaw = drive["price"];
                let priceFormatted = priceRaw.substring(1, priceRaw.length);
                let pricePerTB = priceFormatted / capacityTB;
                drive["Price Per TB"] = pricePerTB;
                pricesPerTB.push(drive);
            }else {
                drive["Price Per TB"] = null;
                pricesPerTB.push(drive);
            }
            
            if(pricesPerTB.length === drives.length) {
                pricesPerTB.sort((a,b) => (a["Price Per TB"] > b["Price Per TB"]) ? 1 : -1);
                resolve(pricesPerTB);
            }
        });
    })
}

cullDrives();

// searchJSON(filePath)
// .then(response => JSON.parse(response))
// .then(data => console.log(data))
// .catch(err => console.log(err));