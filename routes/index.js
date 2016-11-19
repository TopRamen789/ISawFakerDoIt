var express = require('express');
var router = express.Router();
require('dotenv').load();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Riot LoL API');
});

module.exports = router;