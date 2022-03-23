const fs = require('fs');
const _directory = __dirname + "/drives";


let driveFiles = [];


async function collectFilePaths(directory) {
    return new Promise((resolve, reject) => {

        //where we will store the content from the JSON files we read
        console.log("Collecting File paths")
        fs.readdir(directory, (err, files) => {
            if(err) {
                reject(err);
            }
            resolve(files)
        })
    })
}

async function accumulateContent(files) {
    
    return new Promise((resolve, reject) => {
        let accumulatedContent = []
        files.forEach((file) => {
            driveFiles.push(file);
            let newFilePath = __dirname + "/drives/" + file;
            fs.readFile(newFilePath, (err, currentContent) => {
                if(err) {
                    reject(err);
                }
                let parsedContent = JSON.parse(currentContent);

                accumulatedContent.push(parsedContent);
                let theTruth = accumulatedContent.length === files.length;
                console.log(theTruth);
                if(accumulatedContent.length === files.length){
                    console.log('resolved');
                    resolve(accumulatedContent);
                }  
            })
        })
    })
}

async function compileJSONFiles(newFileName) {
    console.log("Compiling the JSON files");
    collectFilePaths(_directory)
    .then(files => accumulateContent(files))
    .then(content => JSON.stringify(content, null, 2))
    .then(data => {
        fs.writeFile(__dirname + "/" + newFileName, data, (err) => {
            if(err) { console.log(err)}
            else {console.log('written!')}
        })
    })
    .catch(err => console.log(err));
}

//compileJSONFiles("accumulatedContent.json");

module.exports = {
    compileJSONFiles
}