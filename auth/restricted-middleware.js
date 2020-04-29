// module.exports = (req, res, next) => {
//     //check that we remember the client,
//     //that the client logged in already
//     if (req.session && req.session.user) {
//         next();
//     } else {
//         res.status(401).json({ message: "You shall not pass!"});
//     };

// };

const jwt = require("jsonwebtoken");
const { jwtSecret } = require('../config/secrets');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    if (authorization) {
        jwt.verify(authorization, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({message: 'Invalid Credentials'})
            } else {
                req.decodedToken = decodedToken;
                next();
            }
        });
    } else {
        res.status(400).json({message: "No credentials provided"});
    }
};