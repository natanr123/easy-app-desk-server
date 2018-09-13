import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send('list');
});

router.post('/:photoType', function(req, res, next) {
  const photoType = req.params.photoType;
  res.send('list: ' + photoType);
});


module.exports = router;
