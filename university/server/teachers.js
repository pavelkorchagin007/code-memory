"use strict";

let db = require('./pghelper');

let findAll = (req, res, next) => {
    let name = req.query.name;
    let sql = `SELECT id, name, email, allowed, IF ( allowed, 'Approved', 'Not') approved
        FROM teacher ORDER BY name`;
    db.query(sql)
        .then(result => res.json(result))
        .catch(next);
};

let findById = (req, res, next) => {
    let id = req.params.id;
    let sql = `SELECT id, name, email, allowed
        FROM teacher WHERE id=?`;
    db.query(sql, [parseInt(id)])
        .then(teachers =>  res.json(teachers[0]))
        .catch(next);
};

let findByData = (req, res, next) => {
    let teacher = req.body;
    let sql = `SELECT id, name, email, allowed FROM teacher WHERE email=? AND pwd=?`;
    db.query(sql, [teacher.email,teacher.pwd])
    .then(teachers =>  res.json(teachers[0]))
    .catch(next);
};

let createItem = (req, res, next) => {
    let teacher = req.body;
    let sql = `
        INSERT IGNORE INTO teacher SET ?`;
    db.query(sql, [teacher])
        .then(result => {
            res.json(result)
        })
        .catch(next);
};

let updateItem = (req, res, next) => {
    let teacher = req.body;
    let sql = `UPDATE teacher SET name=?, email=?, allowed=? WHERE id=?`;
    db.query(sql, [teacher.name, teacher.email, teacher.allowed, teacher.id])
        .then(() => res.send({result: 'ok'}))
        .catch(next);
};

let deleteItem = (req, res, next) => {
    let teacherId = req.params.id;
    db.query('DELETE FROM teacher WHERE id=?', [teacherId], true)
        .then(() =>res.send({result: 'ok'}))
        .catch(next);
};


exports.findAll = findAll;
exports.findById = findById;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.findByData = findByData;
exports.deleteItem = deleteItem;