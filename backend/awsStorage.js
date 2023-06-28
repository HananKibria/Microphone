var fs = require('fs')
const AWS = require('aws-sdk');
function getDestination (req, file, cb) {
  cb(null, file.originalname)
}

// Configure AWS SDK with your access key and secret key
//AWS.config.update();

const bucketName = 'poc-micro';
const s3 = new AWS.S3({
  accessKeyId: 'AKIA2F7ELAHN4LVNYXBD',
  secretAccessKey: 'NT2sg55s1tRBqnKnnkz9TsPGFv7OrHCEd4y8xbWi',
  correctClockSkew: true
});


function MyAWSStorage (opts) {
  this.getDestination = (opts.destination || getDestination)
}

MyAWSStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  this.getDestination(req, file,async function (err, fileName) {
    if (err) return cb(err)
    console.log(fileName);
    console.log(bucketName);
    console.log(file);
    let buffer=fs.readFileSync(fileName);
    console.log(buffer);
    const headParams = {
        Bucket: bucketName,
        Key: 'poc-dev/'+ fileName,
      };
    
      let fileExists = false;
    
      try {
        // await s3.headObject(headParams).promise();
       // fileExists = true;
      } catch (err) {
        // File doesn't exist in S3
        if (err.statusCode !== 404) {
          console.error('Error checking file existence:', err);
          return;
        }
      }
    
      if (fileExists) {
        // Append the recorded blob to the existing file in S3
    
        // Get the current file data from S3
        const getObjectParams = {
          Bucket: bucketName,
          Key: fileName,
        };
    
        const { Body: existingFileData } = await s3.getObject(getObjectParams).promise();
    
        // Concatenate the existing file data with the recorded blob
        const updatedFileData = Buffer.concat([existingFileData,buffer]);
    
        // Update the file in S3
        const putObjectParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: updatedFileData,
        };
    
        try {
          await s3.putObject(putObjectParams).promise();
          console.log('Audio appended to the existing file');
        } catch (err) {
          console.error('Error appending audio to the existing file:', err);
        }
      } else {
        // Create a new file with the recorded blob in S3
        const putObjectParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: 'audio/mp3',
        };
    
        try {
          await s3.putObject(putObjectParams).promise();
          console.log('New audio file created');
        } catch (err) {
          console.error('Error creating new audio file:', err);
        }
      }
    })
}
MyAWSStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
}


module.exports = function (opts) {
  return new MyAWSStorage(opts)
}