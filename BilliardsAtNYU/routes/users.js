var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.user) {
    res.redirect('/users/' + req.user.properties.username);
  } else {
    res.send('not logged in');
  }
});

router.get('/:username', function(req, res, next) {
  res.send(req.user.properties.username);
})

module.exports = router;
