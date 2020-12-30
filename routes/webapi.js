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


module.exports = router;
