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

module.exports = ModelUser;