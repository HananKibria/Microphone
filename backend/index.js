const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const { Readable } = require('stream');

// Configure AWS SDK with your access key and secret key
AWS.config.update({
  accessKeyId: 'YOUR_AWS_ACCESS_KEY',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
});

// Create a new instance of S3
const s3 = new AWS.S3();

// Create an Express app
const app = express();

// Configure multer to handle multipart/form-data
const upload = multer();
const bucketName = 'YOUR_S3_BUCKET_NAME';


// Route for receiving the recorded audio stream
app.post('/upload', upload.single('audio'), async (req, res) => {
  const { buffer } = req.file;

  const fileName = 'recorded-audio.wav';

  // Check if the file exists in S3
  const headParams = {
    Bucket: bucketName,
    Key: fileName,
  };

  let fileExists = false;

  try {
    await s3.headObject(headParams).promise();
    fileExists = true;
  } catch (err) {
    // File doesn't exist in S3
    if (err.statusCode !== 404) {
      console.error('Error checking file existence:', err);
      res.status(500).send('Failed to upload audio');
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
    const updatedFileData = Buffer.concat([existingFileData, buffer]);

    // Update the file in S3
    const putObjectParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: updatedFileData,
    };

    try {
      await s3.putObject(putObjectParams).promise();
      console.log('Audio appended to the existing file');
      res.send('Audio uploaded successfully');
    } catch (err) {
      console.error('Error appending audio to the existing file:', err);
      res.status(500).send('Failed to upload audio');
    }
  } else {
    // Create a new file with the recorded blob in S3

    const putObjectParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: 'audio/wav',
    };

    try {
      await s3.putObject(putObjectParams).promise();
      console.log('New audio file created');
      res.send('Audio uploaded successfully');
    } catch (err) {
      console.error('Error creating new audio file:', err);
      res.status(500).send('Failed to upload audio');
    }
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
