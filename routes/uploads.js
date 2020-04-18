import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import AWS from 'aws-sdk';
import MyImage from "../lib/MyImage";
import MyS3 from "../lib/MyS3";
import Upload from '../models/Upload'
import App from '../models/App'


const router = express.Router();

const findApp = (req, res, next) => {
  App.findOne({name: 'Bear Run'}).then((app)=>{
    res.locals.app = app;
    next();
  })
}

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

router.use(findApp).get('/:app_id', function(req, res, next) {
  const app = res.locals.app;
  console.log('appappappapp: ', app);

  res.send(app);
});


router.use(findApp).post('/:photoType', upload.single('file') , (req, res, next)=> {
  const photoType = req.params.photoType; const file = req.file;
  const path = file.path;
  const filename = file.filename;
  console.log(`received file: ${filename}`);
  const outputFilename = `${photoType}_${filename}`;
  const outputPath = `./${userUploadsFolder}/${outputFilename}`;

  let app = res.locals.app;
  console.log('appappappappappapp: ', app);
  if (app === null) {
    app = new App({name: 'Bear Run'})
  }
  let result = null;
  switch(photoType) {
    case 'screenshot1':
      result = screenshot(app, path, outputPath, outputFilename, photoType, 1);
      break;
    case 'screenshot2':
      result = screenshot(app, path, outputPath, outputFilename, photoType, 2);
      break;
    case 'icon512x512':
      result = icon(app, path, outputPath, outputFilename, photoType, 512, 512);
      break;
    case 'feature1024x500':
      result = icon(app, path, outputPath, outputFilename, photoType, 1024, 500);
      break;
    case 'icon48x48':
      result = icon(app, path, outputPath, outputFilename, photoType, 48, 48);
      break;
    case 'icon36x36':
      result = icon(app, path, outputPath, outputFilename, photoType, 36, 36);
      break;
    case 'icon72x72':
      result = icon(app, path, outputPath, outputFilename, photoType, 72, 72);
      break;
    case 'icon96x96':
      result = icon(app, path, outputPath, outputFilename, photoType, 96, 96);
      break;
    default:
      console.log(`photo type not found: ${photoType}`)
      throw new Error(`photo type not found: ${photoType}`);
  }

  if (result !== null) {
    result.then((obj)=>{
      res.send(obj);
    })
  } else {
    console.log(`result is null: ${photoType}`)
    throw new Error(`result is null: ${photoType}`);
  }


});


// Convert To Min length for any side: 320px. Max length for any side: 3840px. Max aspect ratio: 2:1.:
const screenshot = (app, path, outputPath, outputFilename, photoType, index) => {

  const conertedImageFile = MyImage.saveScreenShootToLocal(path, outputPath, outputFilename, photoType);
  console.log('conertedImageFileconertedImageFileconertedImageFile: ', conertedImageFile);
  return conertedImageFile.then((data) => {
      return MyS3.uploadFileToS3(outputPath, outputFilename);
    })
    .then((s3Response) => {
      return { path: s3Response.Location, photoType };
    }).then((result)=>{
    // const upload = new Upload({name: `icon${width}x${height}`, url: result.path} );
    app[`screenshot${index}`] = result.path;
    console.log('uploaduploaduploaduploadupload: ', app);
    return app.save();
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
  console.log('iconiconiconiconiconiconiconiconiconiconiconiconiconicon')
  const convertedImageFile = MyImage.resize(path, outputPath, width, height);

  return convertedImageFile
      .then(()=>{
        return MyS3.uploadFileToS3(outputPath, outputFilename);
      })
      .then((s3Response) => {
        return { path: s3Response.Location, photoType };
      }).then((result)=>{
        // const upload = new Upload({name: `icon${width}x${height}`, url: result.path} );
        app[photoType] = result.path;
        console.log('uploaduploaduploaduploadupload: ', app);
        return app.save();
      });
};



module.exports = router;
