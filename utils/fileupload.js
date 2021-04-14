const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config = {
    "accessKeyId": 'AKIAUEMUF6VHI3XES7IM',
    "secretAccessKey": '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',
    "region": 'us-west-1',
};
const uploadFile = (fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    // Setting up S3 upload parameters
    const params = {
        Bucket: "mudaninew",
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};




const s3 = new AWS.S3({ region: 'us-west-1' })
const imageUpload = (file) => {
    console.log("file", file)
    return new Promise((resolve, reject) => {
        var tmp_path = file.path;
        image = fs.createReadStream(tmp_path);
        imageName = new Date().getTime() + "-" + file.name.split(' ').join('_');
        const params = {
            Bucket: 'mudaninew',
            Key: imageName,
            ACL: 'public-read',
            Body: image
        };
        s3.putObject(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                let url = "https://mudaninew.s3-us-west-1.amazonaws.com/" + imageName;
                console.log("url", url)
                resolve(url);
            }
        })
    })
}


module.exports = {
    uploadFile,
    imageUpload
}