var express = require('express');
var router = express.Router();

/** Posts */
router.get('/', function(req, res, next) {
  res.send('Posts Page');
});

/** Posts */
router.get('/:id', function(req, res, next) {
  res.render('post', { title: '' });
});

module.exports = router;
