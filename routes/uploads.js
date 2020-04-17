import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import AWS from 'aws-sdk';
import MyImage from "../lib/MyImage";
import MyS3 from "../lib/MyS3";
import Upload from '../models/Upload'
import App from '../models/App'


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

router.get('/:app_id', function(req, res, next) {
  res.send('list');
});


router.post('/:photoType', upload.single('file') , (req, res, next)=> {
  const photoType = req.params.photoType; const file = req.file;
  const path = file.path;
  const filename = file.filename;
  console.log(`received file: ${filename}`);
  const outputFilename = `${photoType}_${filename}`;
  const outputPath = `./${userUploadsFolder}/${outputFilename}`;

  App.findOne({name: 'Bear Run'}).then((app)=>{
    console.log('appappappappappapp: ', app);
    if (app === null) {
      app = new App({name: 'Bear Run'})
    }
    switch(photoType) {
      case 'screenshoot':
        screenshoot(res, path, outputPath, outputFilename, photoType);
        break;
      case 'icon_high_res':
        high_res(res, path, outputPath, outputFilename, photoType);
        break;
      case 'feature_graphic':
        feature_graphic(res, path, outputPath, outputFilename, photoType);
        break;
      case 'icon48x48':
        const result= icon(app, path, outputPath, outputFilename, photoType, 48, 48);
        result.then((obj)=>{
          res.send(obj)
        })
        break;
      default:
        throw `photo type not found: ${photoType}`;
    }
  })


});


// Convert To Min length for any side: 320px. Max length for any side: 3840px. Max aspect ratio: 2:1.:
const screenshoot = (res, path, outputPath, outputFilename, photoType) => {

  const conertedImageFile = MyImage.saveScreenShootToLocal(path, outputPath, outputFilename, photoType);
  console.log('conertedImageFileconertedImageFileconertedImageFile: ', conertedImageFile);
  conertedImageFile.then((data) => {
      return MyS3.uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      res.send({ path: s3Response.Location, photoType });
    });
};

const high_res = (res, path, outputPath, outputFilename, photoType) => {
  const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };

  const convertedImageFile = MyImage.highRes(path, outputPath)


  convertedImageFile
    .then(()=>{
      return uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      res.send({ path: s3Response.Location, photoType });
  });
};

const feature_graphic = (res, path, outputPath, outputFilename, photoType) => {

  const convertedImageFile = MyImage.resize(path, outputPath, 1024, 500)

  convertedImageFile
    .then(()=>{
      return MyS3.uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      res.send({ path: s3Response.Location, photoType });
    });
};

const icon = (app, path, outputPath, outputFilename, photoType, width, height) => {
  const convertedImageFile = MyImage.resize(path, outputPath, width, height);

  return convertedImageFile
      .then(()=>{
        return MyS3.uploadFileToS3(outputPath, outputFilename);
      })
      .then((s3Response) => {
        return { path: s3Response.Location, photoType };
      }).then((result)=>{
        // const upload = new Upload({name: `icon${width}x${height}`, url: result.path} );
        app[`icon${width}x${height}`] = result.path;
        console.log('uploaduploaduploaduploadupload: ', app);
        return app.save();
      });
};


const s3 = (req, res, next) => {

  const S3_BUCKET = process.env.S3_BUCKET;
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = process.env.AWS_REGION;

  console.log('aws keys: ', S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION);



  const s3 = new AWS.S3({apiVersion: '2006-03-01', region: AWS_REGION});
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
};

router.get('/s3', s3);


module.exports = router;
