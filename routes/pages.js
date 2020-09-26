const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

function verifyToken(req, res, next){
    // get token from header
    const token = req.cookies.jwt;
    // console.log(token);
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if(err){
            // console.log(req.cookies.jwt_refresh);
            if(req.cookies.jwt_refresh == undefined){
                return res.render('login', {msg: "You need to login first!!!"});
            }
            let newToken = await refreshTokens(req.cookies.jwt_refresh);
            console.log("After getting token "+newToken);
            if(newToken == undefined || typeof newToken == Number)
                return res.status(403).json({"msg": "Forbidden"});
            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 1000
                ),
                httpOnly: true
            }
            res.cookie('jwt', newToken, cookieOptions);
        }
        req.user = user;
        next();
    });
}

async function refreshTokens(refTok){
    db.query("SELECT * FROM tokens WHERE refresh = ?", [refTok], (err, res) => {
        if(err){
            return;
        }else{
            if(res.length<1){
                return;
            }else{
                jwt.verify(res[0].refresh, process.env.JWT_REFRESH_SECRET, (err, user) => {
                    if(err){
                        return;
                    }
                    // console.log("hi there!");
                    let token = jwt.sign({ user: user}, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });
                    console.log("OOPS: " + token);
                    return token;
                });
            }
        }
    });
}

router.get('/', verifyToken, (req, res) => {
    res.render('dashboard');
});

router.get('/register', (req, res) => {
    res.render('signup');
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;