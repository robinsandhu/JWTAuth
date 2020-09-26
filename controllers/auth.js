const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
    console.log(req.body);

    const {name, username, password, confirmPassword, role} = req.body;

    db.query("SELECT * FROM users WHERE email=?", [username], async (err, results) => {
        if(err) throw err;

        if(results.length>0){
            return res.render('signup', {msg: "Email already registered!!"});
        }
        if(password !== confirmPassword){
            return res.render('signup', {msg: "Password doesn't match. Try Again!"});
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query("INSERT INTO users SET ?", {name: name, email: username, password: hashedPassword, role: role}, (err, results) => {
            if(err){
                console.log(err);
            }else{
                return res.render('login', {msg: "User has been registered!!"});
            }
        });
    });
}

exports.login = async (req, res) => {
    try{
        const { username, password } = req.body;

        if(!username || !password){
            return res.status(400).render('login', {msg: "Please provide a Username or Password!"});
        }

        db.query("SELECT * FROM users WHERE email = ?", [username], async (err, results) => {
            if(err) throw err;

            if(!results || !(await bcrypt.compare(password, results[0].password))){
                return res.status(401).render('login', {msg: "Username or Password is incorrect!"});
            }else{
                //login the user
                const id = results[0].email;
                const user = {
                    name: results[0].name,
                    email: results[0].email
                }

                const token = jwt.sign({ user: user}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                const refreshToken = jwt.sign({user: user}, process.env.JWT_REFRESH_SECRET, {
                    expiresIn: process.env.JWT_REFRESH_EXPIRES
                });

                db.query("INSERT INTO tokens SET ?", {refresh: refreshToken}, (err, results) => {
                    if(err) throw err;
                    // console.log(results);
                })

                console.log(token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 1000
                    ),
                    httpOnly: true
                }

                const cookieOptionsRefresh = {
                    expires: new Date(
                        Date.now() + process.env.JWT_REFRESH_TOKEN_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                res.cookie('jwt_refresh', refreshToken, cookieOptionsRefresh);
                res.redirect('/');
            }
        });

        
    }catch(error){
        console.log(error);
    }
}

exports.refresh = (req, res) => {

}