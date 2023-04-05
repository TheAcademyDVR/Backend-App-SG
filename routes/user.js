const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');


router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email, password, role, status from users where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into users(name, contact, email, password, status, role) value (?,?,?,?, 'false', 'user')";
                connection.query(query, [user.name, user.contact, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully registered." });
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({ message: "Emaily already exist." });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email, password, role, status from users where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect username or password" });
            } else if (results[0].status === "false") {
                return res.status(401).json({ message: "Wait for admin approval" });
            } else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
                    expiresIn: "8h",
                });
                return res.status(200).json({ token: accessToken });
            } else {
                return res.status(400).json({ message: "Something went wrong. Plesar try again later" });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});


router.post('/forgotpassword', (req, res) => {
    const user = req.body;
    query = "select email, password from users where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(200).json({ message: " Password sent seccessfuly to you email." });
            } else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'THE ACADEMY DVR - RECUPERACIÓN DE ACCESOS',
                    html: '<p><b>Tus credenciales del sistema son los siguientes:</b> <br> <b>EMAIL: </b> ' + results[0].email + ' <br> <b>CLAVE: </b> ' + results[0].password + ' <br> <a href="http://localhost:4200/">Click para acceder al sistema</a><p>'
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent successfuly" + info.response);
                    }
                });
                return res.status(200).json({ message: " Password sent seccessfuly to you email." });
            }
        } else {
            return res.status(500).json(err);
        }
    });

});


router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "select id, name, email,contact, status from users where role='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

router.patch('/update', auth.authenticateToken, (req, res) => {
    let user = req.body;
    var query = "update users set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "User id does not exist." })
            }
            return res.status(200).json({ message: "User updated successfully." })
        } else {
            return res.status(500).json(err);
        }
    })
})

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
})


router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select * from users where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect old password." });
            } else if (results[0].password == user.oldPassword) {
                query = "update users set password=? where email=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password updted seccessfully." });
                    } else {
                        return res.status(500).json(err);
                    }
                })

            } else {
                return res.status(400).json({ message: "Something went wrong. Please try againt later" });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})
module.exports = router;