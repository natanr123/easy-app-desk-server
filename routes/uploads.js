import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import aws from 'aws-sdk';


const router = express.Router();

const storage = multer.diskStorage({
  destination: './temp',
  filename(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });
const userUploadsFolder = 'user_uploads';


router.get('/', function(req, res, next) {
  res.send('list');
});


// Convert To Min length for any side: 320px. Max length for any side: 3840px. Max aspect ratio: 2:1.:
const screenshoot = (res, path, outputPath, outputFilename, photoType) => {
  console.log('screenshoot: ', path);
  const image = sharp(`./${path}`);
  const response = (data)=> {
    console.log('converted image', data);
    const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };
    res.send(output);
  };
  image.metadata()
    .then((metadata) => {
      console.log('metadata: ', metadata);
      const width = metadata.width;
      const height = metadata.height;
      if (width<=height){
        if(width < 320) {
          console.log('width lower than 320');
          image.resize(320,null).png().toFile(outputPath)
            .then(response);
        } else {
          console.log('height higher than 320');
          image.png().toFile(outputPath)
            .then(response);
        }
      } else {

        if(height < 320) {
          console.log('width lower than 320');
          image.resize(null,320).png().toFile(outputPath)
            .then(response);

        } else {
          console.log('height higher than 320');
          image.png().toFile(outputPath)
            .then(response);
        }
      }
    })
};

const high_res = (res, path, outputPath, outputFilename, photoType) => {
  sharp(`./${path}`)
    .resize(512,512)
    .ignoreAspectRatio()
    .png()
    .toFile(outputPath)
    .then((data) => {
      console.log('converted image', data);
      const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };
      res.send(output);
    });
};

router.post('/:photoType', upload.single('file') , (req, res, next)=> {
  const photoType = req.params.photoType; const file = req.file;
  const path = file.path;
  const filename = file.filename;
  console.log(`received file: ${filename}`);
  const outputFilename = `${photoType}_${filename}`;
  const outputPath = `./${userUploadsFolder}/${outputFilename}`;
  if (photoType === 'screenshoot') {
    screenshoot(res, path, outputPath, outputFilename, photoType);
  } else if (photoType === 'icon_high_res') {
    high_res(res, path, outputPath, outputFilename, photoType);
  } else {
    throw `photo type not found: ${photoType}`;
  }

});

const s3 = (req, res, next) => {

  const S3_BUCKET = process.env.S3_BUCKET;
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = process.env.AWS_REGION;
  aws.config.region = AWS_REGION;

  console.log('aws keys: ', S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION);



  const s3 = new aws.S3({apiVersion: '2006-03-01', region: AWS_REGION});
  var params = {
    Bucket: S3_BUCKET,
    Key: 'example2.txt',
    Body: 'Uploaded text using the promise-based method!'
  };
  var putObjectPromise = s3.putObject(params).promise();
  putObjectPromise.then(function(data) {
    console.log('Success: ', data);
    res.send('45454545');
  });

    // const fileName = req.query['file-name'];
    // const fileType = req.query['file-type'];
    // const s3Params = {
    //   Bucket: S3_BUCKET,
    //   Key: fileName,
    //   Expires: 60,
    //   ContentType: fileType,
    //   ACL: 'public-read'
    // };


};

router.get('/s3', s3);


module.exports = router;
