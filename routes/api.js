
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");
var mdw = require('../middleware/user.middleware')
const bodyParser = require("body-parser");
var request = require('request')
var token2 = '';
// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

router.post('/signup', async function (req, res) {

    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        // save the user
        await newUser.save();
        res.render('signin');
    }
});


router.post('/signin', async function (req, res) {

    console.log(req.body);

    let user = await User.findOne({ username: req.body.username });

    console.log(user);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
        // check if password matches
        user.comparePassword(req.body.password, async function (err, isMatch) {
            if (isMatch && !err) {
                // if user is found and password is right create a token
                var token = jwt.sign(user.toJSON(), config.secret);
                //lưu vào session
                token2 = token;
                req.session.token = token;
                request.get('http://localhost:3000/api/book', {
                    headers: { 'Authorization': 'JWT ' + token }
                }, function (error, response, body) {
                    res.send(body);
                });
                // return the information including token as JSON
                let books = await Book.find().lean();

                //res.redirect("/api/book");
            } else {
                res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
            }
        });
    }
});



router.post('/book', mdw.check_token, async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        console.log(req.body);
        var newBook = new Book({
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher
        });

        await newBook.save().then(async () => {
            let books = await Book.find().lean();

            res.render('listBook', { books: books });
        }).catch((error) => {
            // xử lý lỗi khi save không thành công
        });

    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
});
  

router.get('/book', passport.authenticate("jwt", { session: false }), async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        let books = await Book.find().lean();
        res.render('listBook', { books: books })
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
});

router.get('/addBook', mdw.check_token, async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        res.render('addBook')
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
});

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;
