var express = require('express');
var router = express.Router();
var formidable = require('formidable');

// const getConnection = require('../lib/database');
const pool = require('../lib/database');
// router.get('/test', async (req, res) => {
//     try {
//         let query = "SELECT * FROM t_crawlers WHERE c_id = ?";
//         let params = [133];
//         const [result1, fields1] = await pool.query(query, params);
    
//         // let crawler = null;
//         // if (result1.length > 0) crawler = result1[0];
    
//         query = "SELECT * FROM t__places DWHERE p_id = ?";
//         params = [2];
//         const [result2, fields2] = await pool.query(query, params);
    
//         // let place = null;
//         // if (result2.length > 0) place = result2[0];

//         res.json({ status: 'OK', result: result1 });
        
//     } catch (err) {
//         console.log(err);
//         res.json({ status: 'ERR' });
//     }
// });


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
router.get('/nutrient/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_nutrients";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//특정 영양소 조회
router.get('/nutrient/get', async (req, res) => {
    try {
        let nId = req.query.nId;
        if (f.isNone(nId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let query = "SELECT * FROM t_nutrients WHERE n_id = ?";
        let params = [nId];
        let [result, fields] = await pool.query(query, params);

        if (result.length < 1) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        }
        res.json({status: 'OK', result: result[0]});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
    
});
//영양소 저장 (추가, 수정)
router.post('/nutrient/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let nId;
        let name = req.body.name;
        let keyword = req.body.keyword;
        let effect = req.body.effect;
        let desc = req.body.desc;
        let descOver = req.body.descOver; 
    
        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword) || f.isNone(effect)) {
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

        let [result, fields] = await pool.query(query, params);

        res.json({status: 'OK'});
    

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    

});
//영양소 삭제 
router.post('/nutrient/delete', async (req, res) => {
    try {
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

        let [existResult, fields] = await pool.query(existCheckQuery, existCheckParams);

        if (existResult < 1) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        }

        if (existResult[0].mfnCnt > 0) {
            res.json({status: 'ERR_EXISTS_FOOD'});
            return;
        } 

        if (existResult[0].msnfCnt > 0) {
            res.json({status: 'ERR_EXISTS_SYMPTOM'});
            return;
        } 

        if (existResult[0].mpnfCnt > 0) {
            res.json({status: 'ERR_EXISTS_PRODUCT'});
            return;
        } 

        if (existResult[0].mdnfCnt > 0) {
            res.json({status: 'ERR_EXISTS_DISEASE'});
            return;
        } 

        let deleteQuery = "DELETE FROM t_nutrients WHERE n_id = ?";
        let deleteParams = [nId];

        let [deleteResult, deleteFields] = await pool.query(deleteQuery, deleteParams);
        res.json({status: 'OK'});

        
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});


//음식 전체 조회
router.get('/food/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_foods";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});
//특정 음식 조회
router.get('/food/get', async (req ,res) => {
    try {
        let fId = req.query.fId;
        if (f.isNone(fId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let query = "SELECT * FROM t_foods WHERE f_id = ?";
        let params = [fId];

        //특정 음식의 기본정보 조회
        let [result, fields] = await pool.query(query, params);

        if (result.length < 1) {
            res.json({ status: 'ERR_NO_DATA'});
            return;
        }

        foodInfo = result[0];

        query = 'SELECT * FROM t_maps_food_nutrient AS fTab ';
        query += 'LEFT JOIN t_nutrients AS nTab ON nTab.n_id = fTab.mfn_n_id ';
        query += 'WHERE fTab.mfn_f_id = ?';
        params = [fId];

        [result, fields] = await pool.query(query, params);

        res.json({status: 'OK', result: {
            food: foodInfo,
            nutrientList: result
        }});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});
//음식 삭제 
router.post('/food/delete', async (req, res) => {
    try {
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
        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        let deleteQuery = "DELETE FROM t_foods WHERE f_id = ?";

        if (result < 1) {
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
            res.json({status: 'ERR_EXISTS_SYMPTOM'});
            return;
        } 

        if (result[0].mpnfCnt > 0) {
            res.json({status: 'ERR_EXISTS_PRODUCT'});
            return;
        } 

        if (result[0].mdnfCnt > 0) {
            res.json({status: 'ERR_EXISTS_DISEASE'});
            return;
        } 
        let deleteParams = [fId];
        let [deleteResult, deleteFields] = await pool.query(deleteQuery, deleteParams);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    

});
//음식 저장 (추가, 수정)
router.post('/food/save', async (req ,res) => {

    try {
        let mode = req.body.mode; // ADD, MODIFY
        let fId;
        let name = req.body.name;
        let keyword = req.body.keyword;
        let desc = req.body.desc;
        let nutrientList = req.body.nutrients;

        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = "";
        let params = [name, keyword, desc];

        if (mode === 'ADD') {
            query += "INSERT INTO t_foods(f_name, f_keyword, f_desc) VALUES(?, ?, ?)";
        } else if (mode === 'MODIFY') {
            fId = req.body.fId;
            if (f.isNone(fId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_foods SET";
            query += " f_name = ?, f_keyword = ?, f_desc = ?";
            query += " WHERE f_id = ?";
            params.push(fId);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }

        let [result, fields] = await pool.query(query, params);

        if (mode === 'ADD') {
            if (nutrientList.length > 0) {
                fId = result.insertId;
                query = 'INSERT INTO t_maps_food_nutrient(mfn_f_id, mfn_n_id) VALUES';
                nutrientList.forEach((nutrient, index) => {
                    if (index != 0) {
                        query += ', (' + fId + ', ' + nutrient + ')';                    
                    } else {
                        query += ' (' + fId + ', ' + nutrient + ')';
                    }
                });
                [result, fields] = await pool.query(query);
            } 

            res.json({status: 'OK'});
            
        } else if (mode === 'MODIFY') {

            query = 'DELETE FROM t_maps_food_nutrient WHERE mfn_f_id = ?';
            let deleteParams = [fId];
            [result, fields] = await pool.query(query, deleteParams);

            if (nutrientList.length > 0) {
                query = 'INSERT INTO t_maps_food_nutrient(mfn_f_id, mfn_n_id) VALUES';
                nutrientList.forEach((nutrient, index) => {
                    if (index != 0) {
                        query += ', (' + fId + ', ' + nutrient + ')';                    
                    } else {
                        query += ' (' + fId + ', ' + nutrient + ')';
                    }
                });

                [result, fields] = await pool.query(query);
                res.json({status: 'OK'});
            } 
            res.json({status: 'OK'});
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
        }
        
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});


//질병 전체 조회
router.get('/disease/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_diseases";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});
//특정 질병 조회
router.get('/disease/get', async (req, res) => {
    try {
        let dId = req.query.dId;
        if (f.isNone(dId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let query = "SELECT * FROM t_diseases WHERE d_id = ?";
        let params = [dId];
        let [result, fields] = await pool.query(query, params);

        if (result.length < 1) {
            res.json({ status: 'ERR_NO_DATA'});
            return;
        }

        let diseaseInfo = result[0];
        query = 'SELECT * FROM t_maps_disease_nutrient_food AS mdnfTab ';
        query += 'LEFT JOIN t_foods AS fTab ON fTab.f_id = mdnfTab.mdnf_target_id ';
        query += 'LEFT JOIN t_nutrients AS nTab ON nTab.n_id = mdnfTab.mdnf_target_id ';
        query += 'WHERE mdnfTab.mdnf_d_id = ?';

        params = [dId];
        [result, fields] = await pool.query(query, params);

        let nutrientFoodInfo = result;

        query = 'SELECT * FROM t_maps_symptom_disease AS msdTab ';
        query += 'JOIN t_symptoms AS sTab ON sTab.s_id = msdTab.msd_s_id ';
        query += 'WHERE msd_d_id = ?';
        params = [dId];
        [result, fields] = await pool.query(query, params);

        res.json({status: 'OK', result: {
            disease: diseaseInfo,
            nutrientFoodList: nutrientFoodInfo,
            symptomList: result
        }});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    
});
//질병 삭제
router.post('/disease/delete', async (req, res) => {
    try {
        let dId = req.body.dId;
        if (f.isNone(dId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let existCheckQuery = "";
        existCheckQuery += "SELECT * ";
        existCheckQuery += "FROM t_diseases AS dTab ";
            existCheckQuery += "LEFT JOIN (SELECT mdnf_d_id, COUNT(*) AS mdnfCnt FROM t_maps_disease_nutrient_food GROUP BY mdnf_d_id) AS mdnfTab ";
                existCheckQuery += "ON dTab.d_id = mdnfTab.mdnf_d_id ";
            existCheckQuery += "LEFT JOIN (SELECT msd_d_id, COUNT(*) AS msdCnt FROM t_maps_symptom_disease GROUP BY msd_d_id) AS msdTab ";
                existCheckQuery += "ON dTab.d_id = msdTab.msd_d_id ";
            existCheckQuery += "LEFT JOIN (SELECT mpd_d_id, COUNT(*) AS mpdCnt FROM t_maps_pet_disease GROUP BY mpd_d_id) AS mpdTab ";
                existCheckQuery += "ON dTab.d_id = mpdTab.mpd_d_id ";
            existCheckQuery += "LEFT JOIN (SELECT mbagd_d_id, COUNT(*) AS mbagdCnt FROM t_maps_breed_age_group_disease GROUP BY mbagd_d_id) AS mbagdTab ";
                existCheckQuery += "ON dTab.d_id = mbagdTab.mbagd_d_id ";
        existCheckQuery += "WHERE dTab.d_id = ?";

        let existCheckParams = [dId];
        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        let deleteQuery = "DELETE FROM t_diseases WHERE d_id = ?";

        if (result < 1) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        }

        if (result[0].mdnfCnt > 0) {
            deleteQuery = "DELETE dTab, mdnfTab ";
            deleteQuery += "FROM t_diseases AS dTab ";
            deleteQuery += "JOIN t_maps_disease_nutrient_food AS mdnfTab ON mdnfTab.mdnf_d_id = dTab.d_id ";
            deleteQuery += "WHERE dTab.d_id = ?";
        } 

        if (result[0].msdCnt > 0) {
            res.json({status: 'ERR_EXISTS_SYMPTOM'});
            return;
        } 

        if (result[0].mpdCnt > 0) {
            res.json({status: 'ERR_EXISTS_PRODUCT'});
            return;
        } 

        if (result[0].mbagdCnt > 0) {
            res.json({status: 'ERR_EXISTS_BREED_AGE_GROUP'});
            return;
        } 
        let deleteParams = [dId];
        [result, fields] = await pool.query(deleteQuery, deleteParams);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    
});
//질병 저장 (추가, 수정)
router.post('/disease/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let dId;
        let bpId = req.body.bpId;
        let name = req.body.name;
        let keyword = req.body.keyword;
        let reason = req.body.reason;
        let management = req.body.management;
        let nutrientFoodData = req.body.nutrientFoodData;
        let symptomData = req.body.symptomData;
        
        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword) || f.isNone(bpId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = '';
        let params = [name, keyword, bpId, reason, management];

        //저장인지 수정인지 확인
        if (mode === 'ADD') { //추가일떄
            query += "INSERT INTO t_diseases(d_name, d_keyword, d_bp_id, d_reason, d_management) VALUES(?, ?, ?, ?, ?)";
        } else if (mode === 'MODIFY') { //수정일때
            dId = req.body.dId;
            if (f.isNone(dId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_diseases SET";
            query += " d_name = ?, d_keyword = ?, d_bp_id = ?, d_reason = ?, d_management = ?";
            query += " WHERE d_id = ?";
            params.push(dId);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }

        //기본정보 INSERT 혹은 UPDATE 실행
        let [result, fields] = await pool.query(query, params);

        //연관된 영양소/음식이 있는지 확인
        if (nutrientFoodData.length > 0) {
            let query = '';
            if (mode === 'ADD') { // 추가일떄
                dId = result.insertId;
                query = 'INSERT INTO t_maps_disease_nutrient_food(mdnf_d_id, mdnf_type, mdnf_target_id) VALUES ';
                nutrientFoodData.forEach((data, index) => {
                    if (index != 0) {
                        query += ', (' + dId + ', "' + data.type + '", ' + data.targetId + ')';                    
                    } else {
                        query += ' (' + dId + ', "' + data.type +'", ' + data.targetId + ')';
                    }
                });

                //연관된 영양소/음식 INSERT 실행
                [result, fields] = await pool.query(query, params);

                //연관된 증상 있는지 확인
                if (symptomData.length > 0) {
                    query = 'INSERT INTO t_maps_symptom_disease(msd_s_id, msd_d_id) VALUES ';
                    symptomData.forEach((data, index) => {
                        if (index != 0) {
                            query += ', (' + data + ', ' + dId + ') ';                    
                        } else {
                            query += '(' + data + ', ' + dId + ') '; 
                        }
                    });

                    [result, fields] = await pool.query(query, params);

                    res.json({status: 'OK', result: result});
                } else {
                    res.json({status: 'OK', result: result});
                }


            } else if (mode === 'MODIFY') { // 수정일때
                query = 'DELETE FROM t_maps_disease_nutrient_food WHERE mdnf_d_id = ?';
                let deleteParams = [dId];

                //기존 연관된 영양소들 DELETE 실행
                [result, fields] = await pool.query(query, deleteParams);

                query = 'INSERT INTO t_maps_disease_nutrient_food(mdnf_d_id, mdnf_type, mdnf_target_id) VALUES';
                nutrientFoodData.forEach((data, index) => {
                    if (index != 0) {
                        query += ', (' + dId + ', "' + data.type + '", ' + data.targetId + ')';                    
                    } else {
                        query += ' (' + dId + ', "' + data.type +'", ' + data.targetId + ')';
                    }
                });
                //새로 입력된 연관된 영양소들 INSERT 실행
                [result, fields] = await pool.query(query, params);

                query = 'DELETE FROM t_maps_symptom_disease WHERE msd_d_id = ?';
                params = [dId];
                [result, fields] = await pool.query(query, params);

                //관련된 증상이 있는지 확인
                if (symptomData.length > 0) { 
                    query = 'INSERT INTO t_maps_symptom_disease(msd_s_id, msd_d_id) VALUES ';
                    params = [dId];
                    symptomData.forEach((data, index) => {
                        if (index != 0) {
                            query += ', (' + data + ', ' + dId + ') ';                    
                        } else {
                            query += '(' + data + ', ' + dId + ') '; 
                        }
                    });

                    //관련된 증상 INSERT 실행
                    [result, fields] = await pool.query(query, params);
                    res.json({status: 'OK', result: result});

                } else {
                    res.json({status: 'OK', result: result});
                }

            }

        } else {
            query = 'DELETE FROM t_maps_symptom_disease WHERE msd_d_id = ?';
            params = [dId];
            [result, fields] = await pool.query(query, params);

            query = 'DELETE FROM t_maps_disease_nutrient_food WHERE mdnf_d_id = ?';
            params = [dId];
            [result, fields] = await pool.query(query, params);

            res.json({status: 'OK', result: result});

        }
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    


});


//증상 전체 조회
router.get('/symptom/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_symptoms";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});
//특정 증상 조회
router.get('/symptom/get', async (req, res) => {

    try {
        let sId = req.query.sId;
        if (f.isNone(sId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let query = "SELECT * FROM t_symptoms WHERE s_id = ?";
        let params = [sId];
        let [result, fields] = await pool.query(query, params);

        if (result.length < 1) {
            res.json({ status: 'ERR_NO_DATA'});
            return;
        }

        let symptomInfo = result[0];

        query = 'SELECT * FROM t_maps_symptom_nutrient_food AS msnfTab ';
        query += 'LEFT JOIN t_foods AS fTab ON fTab.f_id = msnfTab.msnf_target_id ';
        query += 'LEFT JOIN t_nutrients AS nTab ON nTab.n_id = msnfTab.msnf_target_id ';
        query += 'WHERE msnfTab.msnf_s_id = ?';

        params = [sId];
        [result, fields] = await pool.query(query, params);

        let nutrientFoodInfo = result;

        query = 'SELECT * FROM t_maps_symptom_disease AS msdTab ';
        query += 'JOIN t_diseases AS dTab ON dTab.d_id = msdTab.msd_d_id ';
        query += 'WHERE msd_s_id = ?';
        params = [sId];
        [result, fields] = await pool.query(query, params);

        res.json({status: 'OK', result: {
            symptom: symptomInfo,
            nutrientFoodList: nutrientFoodInfo,
            diseaseList: result
        }});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
    
    

});
//증상 삭제 
router.post('/symptom/delete', async (req, res) => {

    try {
        let sId = req.body.sId;
        if (f.isNone(sId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let query = 'DELETE FROM t_symptoms WHERE s_id = ?';    
        let params = [sId];
        let [result, fields] = await pool.query(query, params);

        query = 'DELETE FROM t_maps_symptom_disease WHERE msd_s_id = ?';
        [result, fields] = await pool.query(query, params);

        query = 'DELETE FROM t_maps_symptom_nutrient_food WHERE msnf_s_id = ?';
        [result, fields] = await pool.query(query, params);

        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }


});
//증상 저장 (추가, 수정)
router.post('/symptom/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let sId;
        let name = req.body.name;
        let keyword = req.body.keyword;
        let bpId = req.body.bpId;
        let nutrientFoodData = req.body.nutrientFoodData;
        let diseaseData = req.body.diseaseData;
        
        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword) || f.isNone(bpId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = '';
        let params = [name, keyword, bpId];

        //저장인지 수정인지 확인
        if (mode === 'ADD') { //추가일떄
            query += "INSERT INTO t_symptoms(s_name, s_keyword, s_bp_id) VALUES(?, ?, ?)";
        } else if (mode === 'MODIFY') { //수정일때
            sId = req.body.sId;
            if (f.isNone(sId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_symptoms SET";
            query += " s_name = ?, s_keyword = ?, s_bp_id = ?";
            query += " WHERE s_id = ?";
            params.push(sId);
            let [result, fiedls] = await pool.query(query, params);
        
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }

        if (nutrientFoodData.length > 0) {
            query = '';
            if (mode === 'ADD') { // 추가일떄
                sId = result.insertId;
                query = 'INSERT INTO t_maps_symptom_nutrient_food(msnf_s_id, msnf_type, msnf_target_id) VALUES ';
                nutrientFoodData.forEach((data, index) => {
                    if (index != 0) {
                        query += ', (' + sId + ', "' + data.type + '", ' + data.targetId + ')';                    
                    } else {
                        query += ' (' + sId + ', "' + data.type +'", ' + data.targetId + ')';
                    }
                });
                //연관된 영양소/음식 INSERT 실행
                [result, fiedls] = await pool.query(query);
                //연관된 질병 있는지 확인
                if (diseaseData.length > 0) {
                    query = 'INSERT INTO t_maps_symptom_disease(msd_d_id, msd_s_id) VALUES ';
                    diseaseData.forEach((data, index) => {
                        if (index != 0) {
                            query += ', (' + data + ', ' + sId + ') ';                    
                        } else {
                            query += '(' + data + ', ' + sId + ') '; 
                        }
                    });

                    //연관된 증상 INSERT 실행
                    [result, fiedls] = await pool.query(query);
                    res.json({status: 'OK'});
                } else {
                    res.json({status: 'OK'});
                }

            } else if (mode === 'MODIFY') { // 수정일때
                query = 'DELETE FROM t_maps_symptom_nutrient_food WHERE msnf_s_id = ?';
                let deleteParams = [sId];

                //기존 연관된 영양소들 DELETE 실행
                [result, fiedls] = await pool.query(query, deleteParams);

                query = 'INSERT INTO t_maps_symptom_nutrient_food(msnf_s_id, msnf_type, msnf_target_id) VALUES';
                nutrientFoodData.forEach((data, index) => {
                    if (index != 0) {
                        query += ', (' + sId + ', "' + data.type + '", ' + data.targetId + ')';                    
                    } else {
                        query += ' (' + sId + ', "' + data.type +'", ' + data.targetId + ')';
                    }
                });

                //새로 입력된 연관된 영양소들 INSERT 실행
                [result, fiedls] = await pool.query(query);

                query = 'DELETE FROM t_maps_symptom_disease WHERE msd_s_id = ?';
                params = [sId];
                [result, fiedls] = await pool.query(query, params);

                //관련된 질병이 있는지 확인
                if (diseaseData.length > 0) { 
                    query = 'INSERT INTO t_maps_symptom_disease(msd_d_id, msd_s_id) VALUES ';
                    diseaseData.forEach((data, index) => {
                        if (index != 0) {
                            query += ', (' + data + ', ' + sId + ') ';                    
                        } else {
                            query += '(' + data + ', ' + sId + ') '; 
                        }
                    });

                    //관련된 질병 INSERT 실행
                    [result, fiedls] = await pool.query(query);
                    res.json({status: 'OK', result: result});
        
                } else {
                    res.json({status: 'OK', result: result});
                }
            }

        } else {

            query = 'DELETE FROM t_maps_symptom_disease WHERE msd_s_id = ?';
            params = [sId];
            [result, fiedls] = await pool.query(query, params);

            query = 'DELETE FROM t_maps_symptom_nutrient_food WHERE msnf_s_id = ?';
            params = [sId];
            [result, fiedls] = await pool.query(query, params);

            res.json({status: 'OK', result: result});

        }

        
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    

});


//전체제품 가져오기 
router.get('/product/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_products";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});


//전체 제품 카테고리 가져오기
router.get('/product/category/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_product_categories";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});
//제품 카테고리 저장 (입력, 수정)
router.post('/product/category/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let pcId;
        let name = req.body.name;

        if (f.isNone(name)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = 'INSERT INTO t_product_categories(pc_name) VALUES(?) ';
        let params = [name];

        if (mode === 'ADD') {

        } else if (mode === 'MODIFY') {
            pcId = req.body.pcId;
            if (f.isNone(pcId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_product_categries SET";
            query += " pc_name = ?";
            query += " WHERE pc_id = ?";
            params.push(pcId);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
        }

        let [result, fiedls] = await pool.query(query, params);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

});
//제품 카테고리 삭제
router.post('/product/category/delete', async (req, res) => {

    try {
        let pcId = req.body.pcId;
        if (f.isNone(pcId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let existCheckQuery = 'SELECT * FROM t_products WHERE p_pc_id = ?';
        let existCheckParams = [pcId];

        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        if (result.length > 0) {
            res.json({status: 'ERR_EXIST_PRODUCT'});
            return;

        } else {
            let deleteQuery = 'DELETE FROM t_product_categories WHERE pc_id = ?';
            let deleteParams = [pcId];
            [result, fields] = await pool.query(deleteQuery, deleteParams);
            res.json({status: 'OK'});
        }


    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

    
});


//전체 제품 브랜드 가져오기
router.get('/product/brand/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_product_brands";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }
});
//제품 브랜드 저장 (입력, 수정)
router.post('/product/brand/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let pbId;
        let name = req.body.name;
    
        if (f.isNone(name)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
    
        let query = 'INSERT INTO t_product_brands(pb_name) VALUES(?) ';
        let params = [name];
    
        if (mode === 'ADD') {
    
        } else if (mode === 'MODIFY') {
            pbId = req.body.pbId;
            if (f.isNone(pbId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
    
            query += "UPDATE t_product_brands SET";
            query += " pb_name = ?";
            query += " WHERE pb_id = ?";
            params.push(pbId);
        }

        let [result, fields] = await pool.query(query, params);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }


});
//제품 브랜드 삭제 
router.post('/product/brand/delete', async (req, res) => {

    try {
        let pbId = req.body.pbId;
        if (f.isNone(pbId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
    
        let existCheckQuery = 'SELECT * FROM t_products WHERE p_pb_id = ?';
        let existCheckParams = [pbId];
        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        if (result.length > 0) {
            res.json({status: 'ERR_EXIST_PRODUCT'});
            return; 
        } else {
            let deleteQuery = 'DELETE FROM t_product_brands WHERE pb_id = ?';
            let deleteParams = [pbId];
            [result, fields] = await pool.query(deleteQuery, deleteParams);
            res.json({status: 'OK'});
        }
    

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }


});


//전체 견종 가져오기
router.get('/breeds/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_breeds";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }

});
//견종 저장 (입력, 수정)
router.post('/breeds/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let bId;
        let name = req.body.name;
    
        if (f.isNone(name)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
    
        let query = 'INSERT INTO t_breeds(b_name) VALUES(?) ';
        let params = [name];
    
        if (mode === 'ADD') {
    
        } else if (mode === 'MODIFY') {
            bId = req.body.bId;
            if (f.isNone(bId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
    
            query += "UPDATE t_breeds SET";
            query += " b_name = ?";
            query += " WHERE b_id = ?";
            params.push(bId);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
        }

        let [result, fields] = await pool.query(query, params);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }


});
//견종 삭제
router.post('/breeds/delete', async (req, res) => {

    try {
        let bId = req.body.bId;
        if (f.isNone(bId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
    
        let existCheckQuery = '';
        existCheckQuery += 'SELECT * ';
        existCheckQuery +='FROM t_breeds AS bTab ';
            existCheckQuery += 'LEFT JOIN (SELECT pe_b_id, COUNT(*) AS peCnt FROM t_pets GROUP BY pe_b_id) AS peTab ';
                existCheckQuery += 'ON bTab.b_id = peTab.pe_b_id ';
            existCheckQuery += 'LEFT JOIN (SELECT bag_b_id, COUNT(*) AS bagCnt FROM t_breeds_age_groups GROUP BY bag_b_id) AS bagTab ';
                existCheckQuery += 'ON bTab.b_id = bagTab.bag_b_id ';
        existCheckQuery += 'WHERE bTab.b_id = ?';
    
        let existCheckParams = [bId];

        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        if (result < 1) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        }

        if (result[0].peCnt > 0) {
            res.json({status: 'ERR_EXISTS_PET'});
            return;
        } 

        if (result[0].bagCnt > 0) {
            res.json({status: 'ERR_EXISTS_BREEDS_AGE_GROUPS'});
            return;
        } 

        let deleteQuery = 'DELETE FROM t_breeds WHERE b_id = ?';
        let deleteParams = [bId];
        [result, fields] = await pool.query(deleteQuery, deleteParams);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'}); 
    }


});


module.exports = router;
