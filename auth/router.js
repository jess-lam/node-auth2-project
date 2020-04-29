const bcrypt = require("bcryptjs");
const router = require("express").Router();
const jwt = require('jsonwebtoken');

const Users = require("../users/users-model");
const { jwtSecret } = require('../config/secrets');

router.post("/register", (req, res) => {
    let userInfo = req.body
    if(!userInfo.department) { //checks if the department is missing, then throw an error
        res.status(418).json({message: 'Please add a department.'}) //if statement has to be outside the add function b/c department is NOT NULLABLE and if its inside the add function, it will just hang
    }

    const ROUNDS = process.env.HASHING_ROUNDS || 8;
    const hash = bcrypt.hashSync(userInfo.password, ROUNDS)

    userInfo.password = hash;
    Users.add(userInfo)
    .then(user => {
        const token = generateToken(user);
    res.status(201).json(user, token);
    })
    .catch((error) => {
        res.status(500).json({message: 'Cannot register user.', error})
    });
})

router.post("/login", (req, res) => {
    const { username, password } = req.body

    Users.findby({username})
    .then(([user]) => {
        if(user && bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user);
            // req.session.user = {
            //     id: user.id,
            //     username: user.username
            // }
            res.status(200).json({message: `Welcome ${user.username}!`, token});
        } else {
            res.status(401).json({message: 'Invalid credentials'})
        }
    })
    .catch(err => {
        res.status(500).json({message: err});
    });
})

function generateToken(user) {
    const payload = {
        username: user.username,
        role: user.department || "user"
    };

    const options = {
        expiresIn: '1h',

    };
    return jwt.sign(payload, jwtSecret, options);
}

router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({message: "you can checkout any time you like"})
            } else {
                res.status(200).json({message: "logged out successfully"})
            }
        });
    } else {
        res.status(200).json({message: "already logged out"})
    }
})

module.exports = router;