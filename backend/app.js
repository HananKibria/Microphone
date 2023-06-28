const express = require('express');
const AWS = require('aws-sdk');
const { Readable } = require('stream');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create a new instance of S3
// Create an Express app
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
// app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '10mb' }));
app.use(bodyParser.json());
const routesApi=require("./routes");

app.use("/api",routesApi);


// Configure multer to handle multipart/form-data
// const bucketName = 'YOUR_S3_BUCKET_NAME';



// Start the server
app.listen(4000, () => {
    console.log('Server is listening on port 4000');
  });