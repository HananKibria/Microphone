const { Router } = require('express');
const router = Router();
const multer = require('multer');
// const MyCustomStorage=require("./customStorage")
// const MyAWSStorage=require("./awsStorage")
const AWS = require('aws-sdk');

// let appendStorage= MyAWSStorage({
//     destination: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
// })
// Create an instance of the custom storage engine

// Initialize multer with the custom storage engine
// const upload = multer({ storage: appendStorage });
const bucketName = 'poc-micro';
const s3 = new AWS.S3({
  accessKeyId: 'AKIA2F7ELAHN4LVNYXBD',
  secretAccessKey: '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',
  correctClockSkew: true,
  signatureVersion: 'v4',
});

// const upload = multer();
// const type = upload.single('recordedBlob');


router.get("/create/:filename",async(req,res)=>{
  console.log("hbhjjk");
  let filename=req.params.filename

  const params = {
    Bucket: bucketName,
    Key: filename,
    ContentType:"audio/ogg"
  }

  console.log(params);
  const result = await s3.createMultipartUpload(params).promise()

  console.log(result);
  return res.send(result.UploadId)

})

router.get('/presign/:filename', async (req, res) => {
  // Get the upload ID and part number from the query parameters
  const uploadId = req.query.uploadId;
  const partNumber = req.query.partNumber;
  let filename=req.params.filename

  console.log(uploadId)
  console.log(partNumber);
  // Define the parameters for generating a presigned URL
  const params = {
    Bucket: bucketName,
    Key: filename,
    UploadId: uploadId,
    PartNumber: partNumber,
    Expires:3600,    
  };
  console.log(params);

  // Generate a presigned URL using the S3 client
  const url = await s3.getSignedUrlPromise('uploadPart', params);

  // Send the URL back to the client
  res.send(url);
});

// Define a route handler for /complete
router.post('/complete/:filename', async (req, res) => {
  // Get the upload ID, bucket name, and parts array from the request body
  const uploadId = req.query.uploadId;
  const parts = req.body;
  let filename=req.params.filename
  // Define the parameters for completing the multipart upload
  const params = {
    Bucket: bucketName,
    Key: filename,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts
    }
  };

  // Complete the multipart upload using the S3 client
  await s3.completeMultipartUpload(params).promise();

  // Send a success response to the client
  res.send("done");
});
// Route for receiving the recorded audio stream
// router.post('/upload', type, async (req, res) => {
//   const { buffer } = req.file;

//   const fileName = 'recorded-audio.wav';

//   // Check if the file exists in S3
//   const headParams = {
//     Bucket: bucketName,
//     Key: fileName,
//   };

//   let fileExists = false;

//   try {
//    // await s3.headObject(headParams).promise();
//     //fileExists = true;
//   } catch (err) {
//     // File doesn't exist in S3
//     if (err.statusCode !== 404) {
//       console.error('Error checking file existence:', err);
//       res.status(500).send('Failed to upload audio');
//       return;
//     }
//   }

//   if (fileExists) {
//     // Append the recorded blob to the existing file in S3

//     // Get the current file data from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileName,
//     };

//     const { Body: existingFileData } = await s3.getObject(getObjectParams).promise();

//     // Concatenate the existing file data with the recorded blob
//     const updatedFileData = Buffer.concat([existingFileData, buffer]);

//     // Update the file in S3
//     const putObjectParams = {
//       Bucket: bucketName,
//       Key: fileName,
//       Body: updatedFileData,
//     };

//     try {
//       await s3.putObject(putObjectParams).promise();
//       console.log('Audio appended to the existing file');
//       res.send('Audio uploaded successfully');
//     } catch (err) {
//       console.error('Error appending audio to the existing file:', err);
//       res.status(500).send('Failed to upload audio');
//     }
//   } else {
//     // Create a new file with the recorded blob in S3

//     const putObjectParams = {
//       Bucket: bucketName,
//       Key: fileName,
//       Body: buffer,
//       ContentType: 'audio/wav',
//     };

//     try {
//       await s3.putObject(putObjectParams).promise();
//       console.log('New audio file created');
//       res.send('Audio uploaded successfully');
//     } catch (err) {
//       console.error('Error creating new audio file:', err);
//       res.status(500).send('Failed to upload audio');
//     }
//   }
// });

module.exports = router;
