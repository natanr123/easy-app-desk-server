import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
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
const screenshoot = (res, path, outputPath, outputFilename) => {
  console.log('screenshootscreenshootscreenshoot: ', path);
  const image = sharp(`./${path}`);


  const response = (data)=> {
    console.log('converted image', data);
    const output = { path: `/${userUploadsFolder}/${outputFilename}` };
    res.send(output);
  };

  image.metadata()
    .then((metadata) => {
      const width = metadata.width;
      const height = metadata.height;
      if (width<=height){
        if(width < 320) {
          console.log('width lower than 320');
          image.resize(320,null).png().toFile(outputPath).then(response);
        } else {
          console.log('height higher than 320');
          image.png().toFile(outputPath).then(response);
        }
      } else {

        if(height < 320) {
          console.log('width lower than 320');
          image.resize(null,320).png().toFile(outputPath).then(response);

        } else {
          console.log('height higher than 320');
          image.png().toFile(outputPath).then(response);
        }
      }
      console.log('metadata: ', metadata);
    })
  /*
  sharp(`./${path}`)
    .resize(512,512)
    .ignoreAspectRatio()
    .png()
    .toFile(outputPath)
    .then((data) => {

    });
    */
};
const high_res = (res, path, outputPath, outputFilename) => {
  sharp(`./${path}`)
    .resize(512,512)
    .ignoreAspectRatio()
    .png()
    .toFile(outputPath)
    .then((data) => {
      console.log('converted image', data);
      const output = { path: `/${userUploadsFolder}/${outputFilename}` };
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
    screenshoot(res, path, outputPath, outputFilename);
  } else {
    high_res(res, path, outputPath, outputFilename);
  }

});


module.exports = router;
