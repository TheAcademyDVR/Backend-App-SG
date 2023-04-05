const express = require('express');
const connection = require('../connection');
const router = express.Router();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "INSERT INTO product (name, categoryId, description, price, status) VALUES (?,?,?,?, 'true')";
    connection.query(query, [product.name, product.categoryId, product.description, product.price], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Product Added successfully." })
        } else {
            return res.status(500).json(err);
        }
    })
})

router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    var query = "SELECT P.id, P.name, P.description, P.price, P.status, C.id AS categoryId, C.name AS categoryName FROM product AS P INNER JOIN category AS C WHERE P.categoryId = C.id"
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

router.get('/getByCategory/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const id = req.params.id;
    var query = "SELECT id, name FROM product WHERE categoryId=? and status='true'";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

router.get('/getById/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const id = req.params.id;
    var query = "SELECT id, name, description, price FROM product WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results[0]);
        } else {
            return res.status(500).json(err);
        }
    })
})

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "UPDATE product SET name=?, categoryId=?, description=?, price=? WHERE id=?";
    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Product ID not found." })
            }
            return res.status(200).json({ message: "Product updated succeesfully." });
        } else {
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const id = req.params.id;
    var query = "DELETE FROM product WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Product ID not found." })
            }
            return res.status(200).json({ message: "Product deleted succeesfully." });
        } else {
            return res.status(500).json(err);
        }
    })
})

router.patch('/updatedStatus', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "UPDATE product SET status=? WHERE id=?";
    connection.query(query, [product.status, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Product ID not found." })
            }
            return res.status(200).json({ message: "Product status updated succeesfully." });
        } else {
            return res.status(500).json(err);
        }
    })
})


module.exports = router