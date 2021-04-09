require('dotenv').config({path: '../.env'});
const AWS = require('aws-sdk');
const AWSOptions = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.AWS_BUCKET_NAME,
};

const S3 = new AWS.S3(AWSOptions);

const deleteIt = () => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: [
        {
          Key: 'Ali Sorena - 03 - Negar.mp3',
        },
        {
          Key: 'Orion212_Volskiy_5574.jpg',
        },
      ],
      Quiet: false,
    },
  };
  S3.deleteObjects(params, (err, data) => {
    if (err) {
      console.log('error', err);
    } else {
      if (data) {
        console.log('Successfully deleted', data);
      }
    }
  });
};

deleteIt();
