const express = require('express');
var router = express.Router();
import add from './aaaaa';
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
