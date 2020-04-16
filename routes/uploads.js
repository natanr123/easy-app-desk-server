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


const saveScreenShootToLocal = (path, outputPath, outputFilename, photoType) => {
  console.log('screenshoot: ', path);
  const image = sharp(`./${path}`);
  const response = (data)=> {
    console.log('converted image', data);
    const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };
    res.send(output);
  };
  return image.metadata()
    .then((metadata) => {
      console.log('metadata: ', metadata);
      const width = metadata.width;
      const height = metadata.height;

      if (width<=height){
        if(width < 320) {
          console.log('width lower than 320');
          return image.resize(320,null).png().toFile(outputPath)
        } else {
          console.log('height higher than 320');
          return image.png().toFile(outputPath)
        }
      } else {

        if(height < 320) {
          console.log('height lower than 320');
          return image.resize(null,320).png().toFile(outputPath)

        } else {
          console.log('height higher than 320');
          return image.png().toFile(outputPath);
        }
      }
    });

};

// Convert To Min length for any side: 320px. Max length for any side: 3840px. Max aspect ratio: 2:1.:
const screenshoot = (res, path, outputPath, outputFilename, photoType) => {
  const conertedImageFile = saveScreenShootToLocal(path, outputPath, outputFilename, photoType);
  console.log('conertedImageFileconertedImageFileconertedImageFile: ', conertedImageFile);
  conertedImageFile.then((data) => {
      return uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      console.log('dddddddddddD:', s3Response);
      res.send({ path: s3Response.Location, photoType });
    });
};

const high_res = (res, path, outputPath, outputFilename, photoType) => {
  const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };
  const conertedImageFile = sharp(`./${path}`)
    .resize(512,512)
    .ignoreAspectRatio()
    .png()
    .toFile(outputPath);


  conertedImageFile
    .then(()=>{
      return uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      res.send({ path: s3Response.Location, photoType });
  });
};

const feature_graphic = (res, path, outputPath, outputFilename, photoType) => {
  const output = { path: `/${userUploadsFolder}/${outputFilename}`, photoType };
  const conertedImageFile = sharp(`./${path}`)
    .resize(1024,500)
    .ignoreAspectRatio()
    .png()
    .toFile(outputPath);


  conertedImageFile
    .then(()=>{
      return uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      res.send({ path: s3Response.Location, photoType });
    });
};


const uploadFileToS3 = (localFilePath, s3FileName) => {
  const image = sharp(localFilePath);
  return image.toBuffer()
    .then((buffer) => {
      console.log('buffer: ',buffer);
      return uploadBufferToS3(buffer, s3FileName);
    });
};

const uploadBufferToS3 = (buffer, s3FileName) => {
  const S3_BUCKET = process.env.S3_BUCKET;
  const AWS_REGION = process.env.AWS_REGION;
  const s3 = new aws.S3({apiVersion: '2006-03-01', region: AWS_REGION});

  const params = {
    Bucket: S3_BUCKET,
    Key: s3FileName,
    Body: buffer
  };
  const putObjectPromise = s3.upload(params).promise();
  return putObjectPromise.then(function(data) {
    console.log('Success: ', data);
    return data;
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
  } else if (photoType === 'feature_graphic') {
    feature_graphic(res, path, outputPath, outputFilename, photoType);
  } else {
    throw `photo type not found: ${photoType}`;
  }

});

const s3 = (req, res, next) => {

  const S3_BUCKET = process.env.S3_BUCKET;
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = process.env.AWS_REGION;

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
};

router.get('/s3', s3);


module.exports = router;
