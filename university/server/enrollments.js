"use strict";

let db = require('./pghelper');

let findByStudent = (req, res, next) => {

    let studentId = req.params.id;
    let periodId = req.query.periodId;

    let params = [studentId];
    if (periodId) params.push(periodId);

    let sql = `
        SELECT e.id, e.student_id, e.course_id, c.code, c.name as course_name,
            c.teacher_id, t.name as teacher_name,
            c.period_id, p.name as period_name
        FROM enrollment as e
        INNER JOIN course AS c ON e.course_id=c.id
        INNER JOIN teacher AS t ON c.teacher_id = t.id
        INNER JOIN period AS p ON c.period_id = p.id
        WHERE student_id=? ${periodId ? "AND period_id=?" : ""}
        ORDER BY c.period_id DESC, c.code`;

    db.query(sql, params)
        .then(result => res.json(result))
        .catch(next);

};

let findByCourse = (req, res, next) => {

    let courseId = req.params.id;

    let sql = `
        SELECT e.id, s.id as student_id, name
        FROM enrollment as e
        INNER JOIN student AS s ON e.student_id=s.id
        WHERE course_id=?
        ORDER BY name`;

    db.query(sql, [courseId])
        .then(result => res.json(result))
        .catch(next);

};

let createItem = (req, res, next) => {
    let enrollment = req.body;
    let sql = `INSERT INTO enrollment (course_id, student_id) VALUES (?,?)`;
    db.query(sql, [enrollment.course_id, enrollment.student_id])
        .then(result => {
            let table_name = enrollment.course_code + enrollment.course_id;
            let sql = `INSERT IGNORE INTO ${table_name} (std_id) VALUES (?)`;
            db.query(sql, [enrollment.student_id]);
            res.send({result: "ok"})
        })
        .catch(next);
};

let deleteItem = (req, res, next) => {
    let enrollmentId = req.params.id;
    db.query('DELETE FROM enrollment WHERE id=?', [enrollmentId], true)
        .then(() => res.send({result: 'ok'}))
        .catch(next);
};

exports.findByStudent = findByStudent;
exports.findByCourse = findByCourse;
exports.createItem = createItem;
exports.deleteItem = deleteItem;