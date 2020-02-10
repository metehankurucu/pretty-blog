var express = require('express');
var router = express.Router();

/** Home */
router.get('/', function(req, res, next) {
  res.send('Admin Login');
});

module.exports = router;
