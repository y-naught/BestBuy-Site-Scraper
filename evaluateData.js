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
                let importantDrives = [HDDs, SSDs];
                console.log(`HDDs: ${HDDCount}, SSDs: ${SSDCount}`);
                resolve(importantDrives);
            }else if(counter > drives.length){
                reject("ya done fucked up");
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
        fs.writeFile(`${__dirname}/importantDrives.json`, data, (err) =>{
            if(err) {
                console.log(err);
            }
        });
    })
    .catch(err => console.log(err));
}

cullDrives();

// searchJSON(filePath)
// .then(response => JSON.parse(response))
// .then(data => console.log(data))
// .catch(err => console.log(err));