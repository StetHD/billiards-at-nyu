var express = require('express');
var router = express.Router();
var db = require('../db.js');
var helper = require('./helper.js');

router.get('/new', function(req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      helper.renderWithUser(req, res, 'newpost');
      return;
    }
  }
  res.send("401 Unauthorized");
})

router.post('/new', function(req, res, next) {
  var transaction = db.beginTransaction();
  
  function makeFirstQuery() {
    transaction.cypher({
      query: "MATCH (n:PostCount) RETURN n"
    }, makeSecondQuery);
  }
  
  function makeSecondQuery(err, results) {
    var count = results[0].n.properties.count || 0;
    transaction.cypher({
      query: "CREATE (n:Post {title: {Title}, content: {Content}, date: {Date}, postnumber: {PostNum}, author: {Author}}) RETURN n",
      params: {
        Title: req.body.title,
        Content: req.body.content,
        Date: Date.now(),
        PostNum: count + 1,
        Author: req.user.properties.username
      }
    }, makeThirdQuery);
  }
  
  function makeThirdQuery(err, results) {
    count = results[0].n.properties.postnumber;
    transaction.cypher({
      query: "MATCH (n:PostCount) SET n.count = {Count}",
      params: {
        Count: count
      }
    }, finish);
  }
  
  function finish(err, results) {
    if (err) throw err;
    transaction.commit(done);
  }
  
  function done(err) {
    if (err) throw err;
    console.log("new post transaction commited");
    res.redirect('/');
  }
  
  
  if (req.user) {
    if (req.user.isAdmin) {
      makeFirstQuery();
      return;
    }
  }
  res.send("401 Unauthorized");
});

module.exports = router;