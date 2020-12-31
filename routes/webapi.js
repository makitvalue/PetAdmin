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
router.get('/nutrient/get', (req, res) => {
    let nId = req.query.nId;

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
            if (result.length < 1) {
                res.json({status: 'ERR_NO_DATA'});
                return;
            }

            res.json({status: 'OK', result: result[0]});
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

    if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword) || f.isNone(effect) || f.isNone(desc) || f.isNone(descOver)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = "";
    let params = [name, keyword, effect, desc, descOver];

    if (mode === 'ADD') {
        query += "INSERT INTO t_nutrients(n_name, n_keyword, n_effect, n_desc, n_desc_over) VALUES(?, ?, ?, ?, ?)";
    } else if (mode === 'MODIFY') {
        nId = req.body.nId;
        if (f.isNone(nId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        query += "UPDATE t_nutrients SET";
        query += " n_name = ?, n_keyword = ?, n_effect = ?, n_desc = ?,";
        query += " n_desc_over = ?";
        query += " WHERE n_id = ?";
        params.push(nId);
    } else {
        res.json({status: 'ERR_WRONG_MODE'});
        return;
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

    let existCheckQuery = "";
    existCheckQuery += "SELECT * ";
    existCheckQuery += "FROM t_nutrients AS nTab ";
        existCheckQuery += "LEFT JOIN (SELECT mfn_n_id, COUNT(*) AS mfnCnt FROM t_maps_food_nutrient GROUP BY mfn_n_id) AS mfnTab ";
            existCheckQuery += "ON nTab.n_id = mfnTab.mfn_n_id ";
        existCheckQuery += "LEFT JOIN (SELECT msnf_target_id, COUNT(*) AS msnfCnt FROM t_maps_symptom_nutrient_food WHERE msnf_type = 'NUTRIENT' GROUP BY msnf_target_id) AS msnfTab ";
            existCheckQuery += "ON nTab.n_id = msnfTab.msnf_target_id ";
        existCheckQuery += "LEFT JOIN (SELECT mpnf_target_id, COUNT(*) AS mpnfCnt FROM t_maps_product_nutrient_food WHERE mpnf_type = 'NUTRIENT' GROUP BY mpnf_target_id) AS mpnfTab ";
            existCheckQuery += "ON nTab.n_id = mpnfTab.mpnf_target_id ";
        existCheckQuery += "LEFT JOIN (SELECT mdnf_target_id, COUNT(*) AS mdnfCnt FROM t_maps_disease_nutrient_food WHERE mdnf_type = 'NUTRIENT' GROUP BY mdnf_target_id) AS mdnfTab ";
            existCheckQuery += "ON nTab.n_id = mdnfTab.mdnf_target_id ";
    existCheckQuery += "WHERE nTab.n_id = ?";

    let existCheckParams = [nId];

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            conn.release();
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        conn.query(existCheckQuery, existCheckParams, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }

            if (result < 1) {
                conn.release();
                res.json({status: 'ERR_NO_DATA'});
                return;
            }

            if (result[0].mfnCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_FOOD'});
                return;
            } 

            if (result[0].msnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_SYMPTOM'});
                return;
            } 

            if (result[0].mpnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_PRODUCT'});
                return;
            } 

            if (result[0].mdnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_DISEASE'});
                return;
            } 

            let deleteQuery = "DELETE FROM t_nutrients WHERE n_id = ?";
            let params = [nId];
            conn.query(deleteQuery, params, (error, result) => {
                if (error) {
                    console.log(error);
                    conn.release();
                    res.json({status: 'ERR_MYSQL_QUERY'});
                    return;
                }
    
                conn.release();
                res.json({status: 'OK'});
            });
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
router.get('/food/get', (req ,res) => {

    let fId = req.query.fId;

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
            if (result.length < 1) {
                res.json({ status: 'ERR_NO_DATA'});
                return;
            }

            res.json({status: 'OK', result: result[0]});
        });
    });


});

//음식 삭제 
router.post('/food/delete', (req, res) => {
    let fId = req.body.fId;
    if (f.isNone(fId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let existCheckQuery = "";
    existCheckQuery += "SELECT * ";
    existCheckQuery += "FROM t_foods AS fTab ";
        existCheckQuery += "LEFT JOIN (SELECT mfn_f_id, COUNT(*) AS mfnCnt FROM t_maps_food_nutrient GROUP BY mfn_f_id) AS mfnTab ";
            existCheckQuery += "ON fTab.f_id = mfnTab.mfn_f_id ";
        existCheckQuery += "LEFT JOIN (SELECT msnf_target_id, COUNT(*) AS msnfCnt FROM t_maps_symptom_nutrient_food WHERE msnf_type = 'FOOD' GROUP BY msnf_target_id) AS msnfTab ";
            existCheckQuery += "ON fTab.f_id = msnfTab.msnf_target_id ";
        existCheckQuery += "LEFT JOIN (SELECT mpnf_target_id, COUNT(*) AS mpnfCnt FROM t_maps_product_nutrient_food WHERE mpnf_type = 'FOOD' GROUP BY mpnf_target_id) AS mpnfTab ";
            existCheckQuery += "ON fTab.f_id = mpnfTab.mpnf_target_id ";
        existCheckQuery += "LEFT JOIN (SELECT mdnf_target_id, COUNT(*) AS mdnfCnt FROM t_maps_disease_nutrient_food WHERE mdnf_type = 'FOOD' GROUP BY mdnf_target_id) AS mdnfTab ";
            existCheckQuery += "ON fTab.f_id = mdnfTab.mdnf_target_id ";
    existCheckQuery += "WHERE fTab.f_id = ?";

    let existCheckParams = [fId];

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            conn.release();
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        conn.query(existCheckQuery, existCheckParams, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }

            let deleteQuery = "DELETE FROM t_foods WHERE f_id = ?";

            if (result < 1) {
                conn.release();
                res.json({status: 'ERR_NO_DATA'});
                return;
            }

            if (result[0].mfnCnt > 0) {
                deleteQuery = "DELETE fTab, mfnTab ";
                deleteQuery += "FROM t_foods AS fTab ";
                deleteQuery += "JOIN t_maps_food_nutrient AS mfnTab ON mfnTab.mfn_f_id = fTab.f_id ";
                deleteQuery += "WHERE fTab.f_id = ?";
            } 

            if (result[0].msnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_SYMPTOM'});
                return;
            } 

            if (result[0].mpnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_PRODUCT'});
                return;
            } 

            if (result[0].mdnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_DISEASE'});
                return;
            } 


            let params = [fId];
            conn.query(deleteQuery, params, (error, result) => {
                if (error) {
                    console.log(error);
                    conn.release();
                    res.json({status: 'ERR_MYSQL_QUERY'});
                    return;
                }
    
                conn.release();
                res.json({status: 'OK'});
            });
        });
    });

});

//음식 저장 (추가, 수정)
router.post('/food/save', (req ,res) => {
    let mode = req.body.mode; // ADD, MODIFY
    let fId;
    let name = req.body.name;
    let keyword = req.body.keyword;
});


//질병 전체 조회
router.get('/disease/get/all', (req, res) => {
    let query = "SELECT * FROM t_diseases";

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

//특정 질병 조회
router.get('/disease/get', (req, res) => {
    let dId = req.query.dId;

    if (f.isNone(dId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = "SELECT * FROM t_diseases WHERE d_id = ?";
    let params = [dId];

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
            if (result.length < 1) {
                res.json({ status: 'ERR_NO_DATA'});
                return;
            }

            res.json({status: 'OK', result: result[0]});
        });
    });
});

//질병 삭제
router.post('/disease/delete', (req, res) => {
    let dId = req.body.dId;
    if (f.isNone(dId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let existCheckQuery = "";
    existCheckQuery += "SELECT * ";
    existCheckQuery += "FROM t_foods AS fTab ";
        existCheckQuery += "LEFT JOIN (SELECT mfn_f_id, COUNT(*) AS mfnCnt FROM t_maps_food_nutrient GROUP BY mfn_f_id) AS mfnTab ";
            existCheckQuery += "ON fTab.f_id = mfnTab.mfn_f_id ";
        existCheckQuery += "LEFT JOIN (SELECT msnf_target_id, COUNT(*) AS msnfCnt FROM t_maps_symptom_nutrient_food WHERE msnf_type = 'FOOD' GROUP BY msnf_target_id) AS msnfTab ";
            existCheckQuery += "ON fTab.f_id = msnfTab.msnf_target_id ";
        existCheckQuery += "LEFT JOIN (SELECT mpnf_target_id, COUNT(*) AS mpnfCnt FROM t_maps_product_nutrient_food WHERE mpnf_type = 'FOOD' GROUP BY mpnf_target_id) AS mpnfTab ";
            existCheckQuery += "ON fTab.f_id = mpnfTab.mpnf_target_id ";
        existCheckQuery += "LEFT JOIN (SELECT mdnf_target_id, COUNT(*) AS mdnfCnt FROM t_maps_disease_nutrient_food WHERE mdnf_type = 'FOOD' GROUP BY mdnf_target_id) AS mdnfTab ";
            existCheckQuery += "ON fTab.f_id = mdnfTab.mdnf_target_id ";
    existCheckQuery += "WHERE fTab.f_id = ?";

    let existCheckParams = [dId];

    getConnection((error, conn) => {
        if (error) {
            console.log(error);
            conn.release();
            res.json({ status: 'ERR_MYSQL_POOL' });
            return;
        }

        conn.query(existCheckQuery, existCheckParams, (error, result) => {
            if (error) {
                console.log(error);
                conn.release();
                res.json({status: 'ERR_MYSQL_QUERY'});
                return;
            }

            let deleteQuery = "DELETE FROM t_foods WHERE f_id = ?";

            if (result < 1) {
                conn.release();
                res.json({status: 'ERR_NO_DATA'});
                return;
            }

            if (result[0].mfnCnt > 0) {
                deleteQuery = "DELETE fTab, mfnTab ";
                deleteQuery += "FROM t_foods AS fTab ";
                deleteQuery += "JOIN t_maps_food_nutrient AS mfnTab ON mfnTab.mfn_f_id = fTab.f_id ";
                deleteQuery += "WHERE fTab.f_id = ?";
            } 

            if (result[0].msnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_SYMPTOM'});
                return;
            } 

            if (result[0].mpnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_PRODUCT'});
                return;
            } 

            if (result[0].mdnfCnt > 0) {
                conn.release();
                res.json({status: 'ERR_EXISTS_DISEASE'});
                return;
            } 


            let params = [dId];
            conn.query(deleteQuery, params, (error, result) => {
                if (error) {
                    console.log(error);
                    conn.release();
                    res.json({status: 'ERR_MYSQL_QUERY'});
                    return;
                }
    
                conn.release();
                res.json({status: 'OK'});
            });
        });
    });
});





module.exports = router;
