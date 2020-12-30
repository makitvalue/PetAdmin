var express = require('express');
var router = express.Router();
const getConnection = require('../lib/database');


router.get('/', (req, res) => {
    
    let id = req.query.id;
    let query = "SELECT * FROM t_products WHERE p_id = ?";
    let params = [id];

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        conn.query(query, params, (error, result) => {
            if (error) {
                console.log(error);
                res.json({ status: 'ERR_MYSQL' });
                return;
            }
            
            conn.release();
            res.json({ status: 'OK' });
        });
    });

});

//영양소 전체 조회
router.get('/nutrient/get/all', (req, res) => {
    let query = "SELECT * FROM t_nutrients";

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }
        conn.query(query, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }
            conn.release();
            res.json({status: 'OK', result: result});
        });
    });
});

//특정 영양소 조회
router.get('/nutrient/get/:nId', (req, res) => {
    let nId = req.params.nId;

    if (f.isNone(nId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = "SELECT * FROM t_nutrients WHERE n_id = ?";

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        let params = [nId];
        conn.query(query, params, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }
            conn.release();
            res.json({status: 'OK', result: result});
        });
    });
});

//영양소 저장 (추가, 수정)
router.post('/nutrient/save', (req, res) => {
    let mode = req.body.mode; // ADD, MODIFY
    let nId;
    let name = req.body.name;
    let keyword = req.body.keyword;
    let effect = req.body.effect;
    let desc = req.body.desc;
    let descOver = req.body.descOver; 

    if (f.isNone(mode) || f.isNone(nId) || f.isNone(name) || f.isNone(keyword) || f.isNone(effect) || f.isNone(desc) || f.isNone(descOver)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = "";
    let params = [name, keyword, effect, desc, descOver];

    if (mode === 'ADD') {
        query += "INSERT INTO t_nutrients(n_name, n_keyword, n_effect, n_desc, n_desc_over) VALUES(?, ?, ?, ?, ?)";
    }

    if (mode === 'MODIFY') {
        nId = req.body.nId;
        if (f.isNone(nId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        query += "UPDATE t_nutrients SET";
        query += " n_name = ?, n_keyword = ?, n_effect = ?, n_desc = ?,";
        query += " n_desc_over = ?, n_updated_date = NOW()";
        query += " WHERE n_id = ?";
        params.push(nId);
    }

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            conn.release();
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        conn.query(query, params, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }

            conn.release();
            res.json({status: 'OK', result: result});
        });
    });



});

//영양소 삭제 
router.post('/nutrient/delete', (req, res) => {
    let nId = req.body.nId;
    if (f.isNone(nId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }
    let query = "DELETE FROM t_nutrients WHERE n_id = ?";
    let params = [nId];
    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            conn.release();
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        conn.query(query, params, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
            }

            conn.release();
            res.json({status: 'OK'});
        });
    });
});


//음식 전체 조회
router.get('/food/get/all', (req, res) => {
    let query = "SELECT * FROM t_foods";

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }
        conn.query(query, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }
            conn.release();
            res.json({status: 'OK', result: result});
        });
    });
});

//특정 음식 조회
router.get('/food/get/:fId', (req ,res) => {

    let fId = req.params.fId;

    if (f.isNone(fId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = "SELECT * FROM t_foods WHERE f_id = ?";
    let params = [fId];

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }
        conn.query(query, params, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }
            conn.release();
            res.json({status: 'OK', result: result});
        });
    });


});



module.exports = router;
