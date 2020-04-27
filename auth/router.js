const bcrypt = require("bcryptjs");

const router = require("express").Router();

const Users = require("../users/users-model");

router.post("/register", (req, res) => {
    const userInfo = req.body

    const ROUNDS = process.env.HASHING_ROUNDS || 8;
    const hash = bcrypt.hashSync(userInfo.password, ROUNDS)

    userInfo.password = hash;
    Users.add(userInfo)
    .then(user => {
        res.json(user);
    })
    .catch(err => console.log(err));
})

router.post("/login", (req, res) => {
    const { username, password } = req.body

    Users.findby({username})
    .then(([user]) => {
        console.log(user);
        if(user && bcrypt.compareSync(password, user.password)) {
            req.session.user = {
                id: user.id,
                username: user.username
            }
            res.status(200).json({hello: user.username});
        } else {
            res.status(401).json({message: 'invalid credentials'})
        }
    })
    .catch(err => {
        res.status(500).json({message: err});
    });
})

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