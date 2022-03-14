const fs = require('fs');

async function compileJSON() {
    const driveDir = __dirname + "/drives";
    console.log(driveDir);

    let driveFiles = [];
    let accumulatedContent = [];


    fs.readdir(driveDir, (err, files) => {
        if(err) {
            console.log(err);
        }
        files.forEach((file) => {
            driveFiles.push(file);
            let newFilePath = __dirname + "/drives/" + file;
            fs.readFile(newFilePath, (err, currentContent) => {
                if(err){
                    console.log(err);
                }
                let parsedContent = JSON.parse(currentContent);
                accumulatedContent.push(parsedContent);
            });
        });
    });


    const printer = setInterval(() => {
        console.log(accumulatedContent);
        const newPath = __dirname + "/accumulated.json";
        const jsonFile = JSON.stringify(accumulatedContent, null, 2);
        fs.writeFile(newPath, jsonFile, (err) => {
            if(err) {console.log(err)}
        });
        clearInterval(printer);
        }, 1000);
}

module.exports = {
    combineJSON();
}

