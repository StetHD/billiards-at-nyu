
/* Deprecated mongoose version
var mongoose = require('mongoose'), URLSlugs = require('mongoose-url-slugs');
var passportLocalMongoose = require('passport-local-mongoose');

var Player;

var User = new mongoose.Schema({
    username: String,
    password: String,
    admin: Boolean,
    email: String,
    player: Player,
})

ModelUser = mongoose.model('User',User);


mongoose.connect("mongodb://localhost/BilliardsAtNYU");

module.exports = ModelUser;*/

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:admin@localhost:7474');

/* DB EXAMPLE
db.cypher({
    query: 'MATCH (user:User {email: {email}}) RETURN user',
    params: {
        email: 'alice@example.com'
    }
}, function(err, results) {
    console.log(results[0]['user']);
}); */

module.exports = db;