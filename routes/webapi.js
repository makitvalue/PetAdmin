var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var sharp = require('sharp');
var fs = require('fs');
var imageSize = require('image-size');

// const getConnection = require('../lib/database');
const pool = require('../lib/database');
const { getConnection } = require('../lib/database');
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
        let desc = req.body.desc;
        let descOver = req.body.descOver;
        let descShort = req.body.descShort;

        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = "";
        let params = [name, keyword, desc, descOver, descShort];

        if (mode === 'ADD') {
            query += "INSERT INTO t_nutrients(n_name, n_keyword, n_desc, n_desc_over, n_desc_short) VALUES(?, ?, ?, ?, ?)";
        } else if (mode === 'MODIFY') {
            nId = req.body.nId;
            if (f.isNone(nId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_nutrients SET";
            query += " n_name = ?, n_keyword = ?, n_desc = ?, n_desc_over = ?, n_desc_short = ?";
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

        let thumbnailPath = result[0].f_thumbnail;
        let originThumbnailPath = '';
        if (!f.isNone(thumbnailPath)) {
            originThumbnailPath = `${thumbnailPath.split('.')[0]}_original.${thumbnailPath.split('.')[1]}`;
        }

        let deleteQuery = "DELETE FROM t_foods WHERE f_id = ?";
        let deleteParams = [fId];
        if (result < 1) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        }

        if (result[0].mfnCnt > 0) {
            let nutrientFoodDeleteQuery = 'DELETE FROM t_maps_food_nutrient WHERE mfn_f_id = ?';
            let nutrientFoodDeleteParams = [fId];
            await pool.query(nutrientFoodDeleteQuery, nutrientFoodDeleteParams);
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

        await pool.query(deleteQuery, deleteParams);

        if (!f.isNone(thumbnailPath)) {
            fs.unlinkSync(`public${thumbnailPath}`);
            fs.unlinkSync(`public${originThumbnailPath}`);
        }

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

        let fc1Id = req.body.fc1Id;
        let fc2Id = req.body.fc2Id;
        let edible = req.body.edible;

        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword) || f.isNone(fc1Id) || f.isNone(fc2Id)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = "";
        let params = [name, keyword, desc, fc1Id, fc2Id, edible];

        let result;
        let fields;

        if (mode === 'ADD') {
            query += "INSERT INTO t_foods(f_name, f_keyword, f_desc, f_fc1_id, f_fc2_id, f_edible) VALUES(?, ?, ?, ?, ?, ?)";
        } else if (mode === 'MODIFY') {
            fId = req.body.fId;
            if (f.isNone(fId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_foods SET";
            query += " f_name = ?, f_keyword = ?, f_desc = ?, f_fc1_id = ?, f_fc2_id = ?, f_edible = ? ";
            query += " WHERE f_id = ?";
            params.push(fId);

        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }

        [result, fields] = await pool.query(query, params);

        if (mode === 'ADD') {
            fId = result.insertId;
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
            }

            res.json({status: 'OK', fId: fId});

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
        let operation = req.body.operation;

        if (f.isNone(mode) || f.isNone(name) || f.isNone(keyword) || f.isNone(bpId) || f.isNone(operation)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = '';
        let params = [name, keyword, bpId, reason, management, operation];
        let result;
        let fields;

        //저장인지 수정인지 확인
        if (mode === 'ADD') { //추가일떄
            query += "INSERT INTO t_diseases(d_name, d_keyword, d_bp_id, d_reason, d_management, d_operation) VALUES(?, ?, ?, ?, ?, ?)";
        } else if (mode === 'MODIFY') { //수정일때
            dId = req.body.dId;
            if (f.isNone(dId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query += "UPDATE t_diseases SET";
            query += " d_name = ?, d_keyword = ?, d_bp_id = ?, d_reason = ?, d_management = ?, d_operation = ?";
            query += " WHERE d_id = ?";
            params.push(dId);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }

        //기본정보 INSERT 혹은 UPDATE 실행
        [result, fields] = await pool.query(query, params);

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

        let existCheckQuery = 'SELECT * FROM t_maps_symptom_disease WHERE msd_s_id = ?';
        let existCheckParams = [sId];
        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        if (result.length > 0) {
            res.json({status: 'ERR_EXISTS_DISEASE'});
            return;
        } else {
            let query = 'DELETE FROM t_symptoms WHERE s_id = ?';
            let params = [sId];
            [result, fields] = await pool.query(query, params);

            // query = 'DELETE FROM t_maps_symptom_disease WHERE msd_s_id = ?';
            // [result, fields] = await pool.query(query, params);

            query = 'DELETE FROM t_maps_symptom_nutrient_food WHERE msnf_s_id = ?';
            [result, fields] = await pool.query(query, params);

            res.json({status: 'OK'});
        }

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
        let result;
        let fields;

        //저장인지 수정인지 확인
        if (mode === 'ADD') { //추가일떄
            query += "INSERT INTO t_symptoms(s_name, s_keyword, s_bp_id) VALUES(?, ?, ?)";
            [result, fields] = await pool.query(query, params);
            sId = result.insertId;
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
            [result, fields] = await pool.query(query, params);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }


        if (nutrientFoodData.length > 0) {
            query = '';
            if (mode === 'ADD') { // 추가일떄

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

                console.log(query);

                //연관된 질병 INSERT 실행
                [result, fiedls] = await pool.query(query);
                res.json({status: 'OK'});
            } else {
                res.json({status: 'OK'});
            }

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
        let query = "SELECT * FROM t_products AS pTab";
        query += ' JOIN t_product_categories AS pcTab ON pcTab.pc_id = pTab.p_pc_id';
        query += ' JOIN t_product_brands AS pbTab ON pbTab.pb_id = pTab.p_pb_id';

        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//제품 저장 (등록, 수정)
router.post('/product/save', async (req, res) => {

    try {
        let mode = req.body.mode;
        let pId;
        let pcId = req.body.pcId;
        let pbId = req.body.pbId;
        let name = req.body.name;
        let keyword = req.body.keyword;
        let price = req.body.price;
        let origin = req.body.origin;
        let manufacturer = req.body.manufacturer;
        let packingVolume = req.body.packingVolume;
        let recommend = req.body.recommend;
        let feedNutrients = req.body.feedNutrients;
        let nutrientFoodData = req.body.nutrientFoodData;

        if (f.isNone(pcId) || f.isNone(pbId) || f.isNone(name) || f.isNone(keyword)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        if (f.isNone(price)) {
            price = null;
        }

        let query = '';
        let params = [pcId, pbId, name, keyword, price, origin, manufacturer, packingVolume, recommend];

        if (mode === 'ADD') {
            //제품 추가일때

            query = 'INSERT INTO t_products(p_pc_id, p_pb_id, p_name, p_keyword, p_price, p_origin, p_manufacturer, p_packing_volume, p_recommend)';
            query += ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
            let [result, fields] = await pool.query(query, params);
            pId = result.insertId;

            //관련 영양소/음식 테이블 추가
            if (nutrientFoodData.length > 0) {
                query = 'INSERT INTO t_maps_product_nutrient_food(mpnf_p_id, mpnf_type, mpnf_target_id) VALUES ';
                nutrientFoodData.forEach((data, index) => {
                    if (index != 0) {
                        query += ', (' + pId + ', "' + data.type + '", ' + data.targetId + ')';
                    } else {
                        query += ' (' + pId + ', "' + data.type +'", ' + data.targetId + ')';
                    }
                });
                await pool.query(query, params);
            }

            query = 'DELETE FROM t_feed_nutrients WHERE fn_p_id = ?';
            params = [pId];
            await pool.query(query, params);

            //카테고리가 제품일때
            if (pcId == 1) {
                let feedQuery = 'INSERT INTO t_feed_nutrients(fn_prot, fn_fat, fn_fibe, fn_ash, fn_calc, fn_phos, fn_mois, fn_p_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
                let feedParams = [
                    ((feedNutrients.prot) ? feedNutrients.prot : null),
                    ((feedNutrients.fat) ? feedNutrients.fat : null),
                    ((feedNutrients.fibe) ? feedNutrients.fibe : null),
                    ((feedNutrients.ash) ? feedNutrients.ash : null),
                    ((feedNutrients.calc) ? feedNutrients.calc : null),
                    ((feedNutrients.phos) ? feedNutrients.phos : null),
                    ((feedNutrients.mois) ? feedNutrients.mois : null),
                    pId
                ];
                [result, fields] = await pool.query(feedQuery, feedParams);
            }
            res.json({status: 'OK', pId: pId});

        } else if (mode === 'MODIFY') {
            //제품 수정일때

            pId = req.body.pId;

            if (f.isNone(pId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }

            query = 'UPDATE t_products';
            query += ' SET p_pc_id = ?, p_pb_id = ?, p_name = ?, p_keyword = ?, p_price = ?, p_origin = ?, p_manufacturer = ?, p_packing_volume = ?, p_recommend = ?';
            query += ' WHERE p_id = ?';
            params.push(pId);
            [result, fields] = await pool.query(query, params);

            //관련 영양소/음식 테이블 삭제
            query = 'DELETE FROM t_maps_product_nutrient_food WHERE mpnf_p_id = ?';
            params = [pId];
            await pool.query(query, params);

            //관련 영양소/음식 테이블 수정
            if (nutrientFoodData.length > 0) {
                query = 'INSERT INTO t_maps_product_nutrient_food(mpnf_p_id, mpnf_type, mpnf_target_id) VALUES ';
                nutrientFoodData.forEach((data, index) => {
                    if (index != 0) {
                        query += ', (' + pId + ', "' + data.type + '", ' + data.targetId + ')';
                    } else {
                        query += ' (' + pId + ', "' + data.type +'", ' + data.targetId + ')';
                    }
                });
                await pool.query(query, params);
            }

            query = 'DELETE FROM t_feed_nutrients WHERE fn_p_id = ?';
            params = [pId];
            await pool.query(query, params);

            //카테고리가 제품일때
            if (pcId == 1) {
                let feedQuery = 'INSERT INTO t_feed_nutrients(fn_prot, fn_fat, fn_fibe, fn_ash, fn_calc, fn_phos, fn_mois, fn_p_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
                let feedParams = [
                    ((feedNutrients.prot) ? feedNutrients.prot : null),
                    ((feedNutrients.fat) ? feedNutrients.fat : null),
                    ((feedNutrients.fibe) ? feedNutrients.fibe : null),
                    ((feedNutrients.ash) ? feedNutrients.ash : null),
                    ((feedNutrients.calc) ? feedNutrients.calc : null),
                    ((feedNutrients.phos) ? feedNutrients.phos : null),
                    ((feedNutrients.mois) ? feedNutrients.mois : null),
                    pId];
                [result, fields] = await pool.query(feedQuery, feedParams);
            }

            res.json({status: 'OK'});

        }
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }




});
//특정 제품 조회
router.get('/product/get', async (req, res) => {

    try {
        let pId = req.query.pId;
        if (f.isNone(pId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        let query = 'SELECT * FROM t_products WHERE p_id = ?';
        let params = [pId];
        let [result, fields] = await pool.query(query, params);

        if (result.length < 1) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        }

        let productInfo = result[0];

        query = 'SELECT * FROM t_feed_nutrients WHERE fn_p_id = ?';
        params = [pId];
        [result, fields] = await pool.query(query, params);

        let feedNutrientInfo = result[0];

        query = 'SELECT * FROM t_images WHERE i_data_type = "PRODUCT" AND i_target_id = ?';
        params = [pId];
        [result, fields] = await pool.query(query, params);

        let imageList = result;

        query = 'SELECT * FROM t_maps_product_nutrient_food AS mpnfTab ';
        query += 'LEFT JOIN t_foods AS fTab ON fTab.f_id = mpnfTab.mpnf_target_id ';
        query += 'LEFT JOIN t_nutrients AS nTab ON nTab.n_id = mpnfTab.mpnf_target_id ';
        query += 'WHERE mpnfTab.mpnf_p_id = ?';

        params = [pId];
        [result, fields] = await pool.query(query, params);

        let nutrientFoodInfo = result;


        res.json({status: 'OK', result: {
            product: productInfo,
            feedNutrients: feedNutrientInfo,
            imageList: imageList,
            nutrientFoodList: nutrientFoodInfo
        }});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//제품 삭제
router.post('/product/delete', async (req, res) => {
    try {
        let pId = req.body.pId;

        if (f.isNone(pId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let existCheckQuery = 'SELECT * FROM t_products AS pTab';
        existCheckQuery += ' LEFT JOIN (SELECT mpp_p_id, COUNT(*) AS mppCnt FROM t_maps_pet_product GROUP BY mpp_p_id) AS mppTab ';
            existCheckQuery += ' ON mppTab.mpp_p_id = pTab.p_id';
        existCheckQuery += ' LEFT JOIN (SELECT pr_p_id, COUNT(*) AS prCnt FROM t_product_reviews GROUP BY pr_p_id) AS prTab '
            existCheckQuery += ' ON pTab.p_id = prTab.pr_p_id';
        existCheckQuery += ' WHERE pTab.p_id = ?';

        let existCheckParams = [pId];
        let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        let thumbnailPath = result[0].p_thumbnail;
        let originThumbnailPath = `${thumbnailPath.split('.')[0]}_original.${thumbnailPath.split('.')[1]}`;

        if (result[0].mppCnt > 0) {
            res.json({status: 'ERR_EXISTS_PET'});
            return;
        }

        if (result[0].prCnt > 0) {
            res.json({status: 'ERR_EXISTS_REVIEW'});
            return;
        }

        let deleteQuery = "DELETE FROM t_products WHERE p_id = ?";
        let deleteParams = [pId];
        await pool.query(deleteQuery, deleteParams);

        deleteQuery = "DELETE FROM t_maps_product_nutrient_food WHERE mpnf_p_id = ?";
        deleteParams = [pId];
        await pool.query(deleteQuery, deleteParams);

        let imageSelectQuery = 'SELECT * FROM t_images WHERE i_data_type = "product" AND i_target_id = ?';
        let imageSelectParams = [pId];
        let [imageResult, imageFields] = await pool.query(imageSelectQuery, imageSelectParams);

        if (imageResult.length > 0) {
            let originImagePath = '';
            imageResult.forEach((item, index) => {
                originImagePath = `${item.i_path.split('.')[0]}_original.${item.i_path.split('.')[1]}`;
                fs.unlinkSync(`public${item.i_path}`);
                fs.unlinkSync(`public${originImagePath}`);
            });
        }

        fs.unlinkSync(`public${thumbnailPath}`);
        fs.unlinkSync(`public${originThumbnailPath}`);

        deleteQuery = "DELETE FROM t_images WHERE i_data_type = 'product' AND i_target_id = ?";
        deleteParams = [pId];
        await pool.query(deleteQuery, deleteParams);

        res.json({status: 'OK'});

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

        let query = '';
        let params = [name];

        if (mode === 'ADD') {
            query = 'INSERT INTO t_product_categories(pc_name) VALUES(?) ';
        } else if (mode === 'MODIFY') {
            pcId = req.body.pcId;
            if (f.isNone(pcId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            query = "UPDATE t_product_categories SET";
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
            res.json({status: 'ERR_EXISTS_PRODUCT'});
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

        let query = '';
        let params = [name];

        if (mode === 'ADD') {
            query = 'INSERT INTO t_product_brands(pb_name) VALUES(?) ';
        } else if (mode === 'MODIFY') {
            pbId = req.body.pbId;
            if (f.isNone(pbId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }

            query = "UPDATE t_product_brands SET";
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
            res.json({status: 'ERR_EXISTS_PRODUCT'});
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
router.get('/breed/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_breeds";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }

});
//특정 견종 가져오기
router.get('/breed/get', async (req, res) => {
   try {
        let bId = req.query.bId;
        if (f.isNone(bId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = 'SELECT * FROM t_breeds WHERE b_id = ?';
        let params = [bId];
        let [result, fields] = await pool.query(query, params);
        let breedsInfo = result[0];

        query = 'SELECT * FROM t_breed_age_groups WHERE bag_b_id = ?';
        params = [bId];
        [result, fields] = await pool.query(query, params);

        if (result.length < 0) {
            res.json({status: 'ERR_NO_DATA'});
            return;
        } else {
            res.json({status: 'OK', result: {
                breed : breedsInfo,
                breedAgeGroupList: result
            }});
        }

   } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
   }
});
//견종 저장 (입력, 수정)
router.post('/breed/save', async (req, res) => {
    try {
        let mode = req.body.mode; // ADD, MODIFY
        let bId;
        let bType = req.body.bType;
        let name = req.body.name;
        let keyword = req.body.keyword;
        let breedAgeGroups = req.body.breedAgeGroups;
        let deleteBreedAgeGroups = req.body.deleteBreedAgeGroups;

        if (f.isNone(name) || f.isNone(keyword) || f.isNone(bType)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let query = '';
        let params = [name, keyword, bType];

        if (mode === 'ADD') {
            query = 'INSERT INTO t_breeds(b_name, b_keyword, b_type) VALUES(?, ?, ?) ';
        } else if (mode === 'MODIFY') {
            bId = req.body.bId;
            if (f.isNone(bId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }

            query = "UPDATE t_breeds SET";
            query += " b_name = ?,";
            query += " b_keyword = ?,";
            query += " b_type = ?";
            query += " WHERE b_id = ?";
            params.push(bId);
        } else {
            res.json({status: 'ERR_WRONG_MODE'});
        }

        let [result, fields] = await pool.query(query, params);

        if (mode === 'ADD') {
            bId = result.insertId;
        }

        query = 'DELETE FROM t_breed_age_groups WHERE bag_b_id = ?';
        params = [bId];
        [result, fields] = await pool.query(query, params);

        if (deleteBreedAgeGroups.length > 0) {
            query = 'DELETE FROM t_maps_breed_age_group_disease WHERE 1=1';
            deleteBreedAgeGroups.forEach((item, index) => {
                query += ` OR mbagd_bag_id = ${item}`;
            });
            [result, fields] = await pool.query(query);
        }

        if (breedAgeGroups.length > 0) {

            if (mode === 'ADD') {
                query = 'INSERT INTO t_breed_age_groups(bag_b_id, bag_min_age, bag_max_age) VALUES ';
                breedAgeGroups.forEach( (item, index) => {
                    if (index == 0) {
                        query += `(${bId}, ${item.minAge}, ${item.maxAge})`;
                    } else {
                        query += `, (${bId}, ${item.minAge}, ${item.maxAge})`;
                    }
                });

            } else if (mode === 'MODIFY') {
                query = 'INSERT INTO t_breed_age_groups(bag_id, bag_b_id, bag_min_age, bag_max_age) VALUES ';
                breedAgeGroups.forEach( (item, index) => {
                    if (index == 0) {
                        query += `(${item.bagId}, ${bId}, ${item.minAge}, ${item.maxAge})`;
                    } else {
                        query += `, (${item.bagId}, ${bId}, ${item.minAge}, ${item.maxAge})`;
                    }
                });
            }
            [result, fields] = await pool.query(query);
        }
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }


});
//견종 삭제
router.post('/breed/delete', async (req, res) => {

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
            existCheckQuery += 'LEFT JOIN (SELECT bag_b_id, COUNT(*) AS bagCnt FROM t_breed_age_groups GROUP BY bag_b_id) AS bagTab ';
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
            res.json({status: 'ERR_EXISTS_BREED_AGE_GROUP'});
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


//견종 나이대별 그룹에 따른 취약질병 가져오기
router.get('/breed/weak/disease/get', async (req, res) => {
    let bagId = req.query.bagId;
    if (f.isNone(bagId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = 'SELECT * FROM t_maps_breed_age_group_disease AS mbagdTab ';
    query += ' JOIN t_diseases AS dTab ON dTab.d_id = mbagdTab.mbagd_d_id ';
    query += ' WHERE mbagd_bag_id = ? ORDER BY mbagd_bcs';

    let params = [bagId];
    let [result, fields] = await pool.query(query, params);

    res.json({status: 'OK', result: result});

});
//취약질병 추가
router.post('/breed/weak/disease/add', async (req, res) => {
    let bagId = req.body.bagId;
    let dId = req.body.dId;
    let bcs = req.body.bcs;

    if (f.isNone(bagId) || f.isNone(dId) || f.isNone(bcs)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = 'INSERT INTO t_maps_breed_age_group_disease(mbagd_bag_id, mbagd_d_id, mbagd_bcs) VALUES(?, ?, ?)';
    let params = [bagId, dId, bcs];
    let [result, fields] = await pool.query(query, params);

    res.json({status: 'OK'});

});
//취약질병 삭제
router.post('/breed/weak/disease/delete', async (req, res) => {
    let mbagdId = req.body.mbagdId;
    if (f.isNone(mbagdId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = 'DELETE FROM t_maps_breed_age_group_disease WHERE mbagd_id = ?';
    let params = [mbagdId];
    let [result, fields] = await pool.query(query, params);

    res.json({status: 'OK'});

});
//취약질병 수정
router.post('/breed/weak/disease/modify', async (req, res) => {
    let mbagdId = req.body.mbagdId;
    let bcs = req.body.bcs;
    let dId = req.body.dId;

    if (f.isNone(mbagdId) || f.isNone(bcs) || f.isNone(dId)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let query = 'UPDATE t_maps_breed_age_group_disease SET mbagd_bcs = ?, mbagd_dId = ? WHERE mbagd_id = ?';
    let params = [bcs, dId, mbagdId];
    let [result, fields] = await pool.query(query, params);

    res.json({status: 'OK'});

    // bcs, dId
});


//전체 접종테이블 조회
router.get('/inoculation/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_inoculations";
        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//접종테이블 저장 (추가, 수정)
router.post('/inoculation/save', async (req, res) => {
    try {
        let inId;
        let mode = req.body.mode;
        let name = req.body.name;

        if (f.isNone(mode) || f.isNone(name)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        if (mode === 'ADD') {
            let query = 'INSERT INTO t_inoculations(in_name) VALUES(?)';
            let params = [name];
            await pool.query(query, params);
            res.json({status: 'OK'});

        } else if (mode === 'MODIFY') {
            inId = req.body.inId;
            if (f.isNone(inId)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }

            let query = 'UPDATE t_inoculations SET in_name = ? WHERE in_id = ?';
            let params = [name, inId];
            await pool.query(query, params);
            res.json({status: 'OK'});

        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }


    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//접종테이블 삭제
router.post('/inoculation/delete', async (req, res) => {
    try {
        let inId = req.body.inId;

        if (f.isNone(inId)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        let existCheckQuery = 'SELECT * FROM t_maps_pet_inoculation WHERE mpin_in_id = ?';
        let existCheckParams = [inId];
        [result, fields] = await pool.query(existCheckQuery, existCheckParams);

        if (result.length > 0) {
            res.json({status: 'ERR_EXISTS_PET'});
            return;
        }

        let query = 'DELETE FROM t_inoculations WHERE in_id = ?';
        let params = [inId];
        await pool.query(query, params);
        res.json({status: 'OK'});

    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }

});


//전체 음식 카테고리1 가져오기
router.get('/food/category1/get/all', async (req, res) => {
    try {
        let query = "SELECT * FROM t_food_categories1 AS fc1Tab";
        query += " LEFT JOIN (SELECT fc2_fc1_id, GROUP_CONCAT(CONCAT_WS(':', fc2_id, fc2_name) SEPARATOR '|') AS fc2_info FROM t_food_categories2 GROUP BY fc2_fc1_id) AS fc2Tab";
        query += " ON fc1Tab.fc1_id = fc2Tab.fc2_fc1_id;";

        let [result, fields] = await pool.query(query);
        res.json({status: 'OK', result: result});
    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//음식 카테고리1 저장 (입력, 수정)
router.post('/food/category1/save', async (req, res) => {
    try {
        let fc1Id;
        let mode = req.body.mode;
        let name = req.body.name;

        if (f.isNone(mode) || f.isNone(name)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }

        if (mode === 'ADD') {
            let query = 'INSERT INTO t_food_categories1(fc1_name) VALUES(?)';
            let params = [name];
            await pool.query(query, params);
            res.json({status: 'OK'});

        } else if (mode === 'MODIFY') {
            fc1Id = req.body.fc1Id;
            if (f.isNone(fc1Id)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }

            let query = 'UPDATE t_food_categories1 SET fc1_name = ? WHERE fc1_id = ?';
            let params = [name, fc1Id];
            await pool.query(query, params);
            res.json({status: 'OK'});

        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }


    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//음식 카테고리1 삭제
router.post('/food/category1/delete', async (req, res) => {
    let fc1Id = req.body.fc1Id;

    if (f.isNone(fc1Id)) {
        res.json({stauts: 'ERR_WRONG_PARAM'});
        return;
    }

    let existCheckQuery = 'SELECT * FROM t_food_categories1 AS fc1Tab';
    existCheckQuery += ' LEFT JOIN (SELECT *, COUNT(*) AS fc2Cnt FROM t_food_categories2 GROUP BY fc2_id) AS fc2Tab';
        existCheckQuery += ' ON fc2Tab.fc2_fc1_id = fc1Tab.fc1_id';
    existCheckQuery += ' LEFT JOIN (SELECT *, COUNT(*) AS fCnt FROM t_foods GROUP BY f_id) AS fTab';
        existCheckQuery += ' ON fTab.f_fc1_id = fc1Tab.fc1_id';
    existCheckQuery += ' WHERE fc1Tab.fc1_id = ?';

    let existCheckParams = [fc1Id];

    let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

    if (result[0].fc2Cnt > 0) {
        res.json({status: 'ERR_EXISTS_CATEGORY2'});
        return;
    }

    if (result[0].fCnt > 0) {
        res.json({status: 'ERR_EXISTS_FOOD'});
        return;
    }

    let query = 'DELETE FROM t_food_categories1 WHERE fc1_id = ?';
    let params = [fc1Id];
    await pool.query(query, params);

    res.json({status: 'OK'});
});


//음식 카테고리2 저장 (입력, 수정)
router.post('/food/category2/save', async (req, res) => {
    try {
        let fc1Id = req.body.fc1Id;
        let fc2Id;
        let mode = req.body.mode;
        let name = req.body.name;

        if (f.isNone(mode) || f.isNone(name)) {
            res.json({status: 'ERR_WRONG_PARAM'});
            return;
        }
        if (mode === 'ADD') {
            if (f.isNone(fc1Id)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }
            let query = 'INSERT INTO t_food_categories2(fc2_name, fc2_fc1_id) VALUES(?, ?)';
            let params = [name, fc1Id];
            await pool.query(query, params);
            res.json({status: 'OK'});

        } else if (mode === 'MODIFY') {
            fc2Id = req.body.fc2Id;
            if (f.isNone(fc2Id)) {
                res.json({status: 'ERR_WRONG_PARAM'});
                return;
            }

            let query = 'UPDATE t_food_categories2 SET fc2_name = ? WHERE fc2_id = ?';
            let params = [name, fc2Id];
            await pool.query(query, params);
            res.json({status: 'OK'});

        } else {
            res.json({status: 'ERR_WRONG_MODE'});
            return;
        }


    } catch (error) {
        console.log(error);
        res.json({status: 'ERROR_SERVER'});
    }
});
//음식 카테고리2 삭제
router.post('/food/category2/delete', async (req, res) => {
    let fc2Id = req.body.fc2Id;

    if (f.isNone(fc2Id)) {
        res.json({stauts: 'ERR_WRONG_PARAM'});
        return;
    }

    let existCheckQuery = 'SELECT * FROM t_food_categories2 AS fc2Tab';
    existCheckQuery += ' LEFT JOIN (SELECT *, COUNT(*) AS fCnt FROM t_foods GROUP BY f_id) AS fTab';
        existCheckQuery += ' ON fTab.f_fc2_id = fc2Tab.fc2_id';
    existCheckQuery += ' WHERE fc2Tab.fc2_id = ?';

    let existCheckParams = [fc2Id];

    let [result, fields] = await pool.query(existCheckQuery, existCheckParams);

    if (result[0].fCnt > 0) {
        res.json({status: 'ERR_EXISTS_FOOD'});
        return;
    }

    let query = 'DELETE FROM t_food_categories2 WHERE fc2_id = ?';
    let params = [fc2Id];
    await pool.query(query, params);

    res.json({status: 'OK'});
});


//이미지 저장
router.post('/upload/image', async (req, res) => {
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = 'upload/tmp';
    form.multiples = true;
    form.keepExtensions = true;

    form.parse(req, function(error, body, files) {
        if (error) {
            res.json({ status: 'ERR_UPLOAD' });
            return;
        }

        let dataType = body.dataType;
        let type = body.type; // THUMB, IMAGE, IMAGE_DETAIL
        let targetId = body.targetId; // 데이터 아이디

        let imageName = f.generateRandomId();
        let imageFilePath = `public/images/${dataType}/${imageName}_original.jpg`;

        let reImageFilePath = `public/images/${dataType}/${imageName}.jpg`;
        let reImagePath = `/images/${dataType}/${imageName}.jpg`;

        fs.rename(files.image.path, imageFilePath, function() {

            let stats = fs.statSync(imageFilePath);
            let originFileSize = stats.size;
            let originWidth = imageSize(imageFilePath).width;

            let rw = 0;

            fs.copyFile(imageFilePath, reImageFilePath, async () => {

                if (originFileSize < 200000) {

                } else {
                    let reSize = originFileSize;
                    let per = 0;
                    while (reSize > 200000) {
                        per += 5;
                        rw = parseInt(originWidth * ((100 - per) / 100));
                        await sharp(imageFilePath)
                            .resize({width: rw})
                            .toFile(reImageFilePath);
                        reSize = fs.statSync(reImageFilePath).size;
                    }
                }

                if (type === 'THUMB') {
                    // UPDATE data thumbnail
                    let query = '';
                    let params = [reImagePath, targetId];

                    if (dataType === 'food') {
                        query = 'UPDATE t_foods SET f_thumbnail = ? WHERE f_id = ? ';
                    } else if (dataType === 'product') {
                        query = 'UPDATE t_products SET p_thumbnail = ? WHERE p_id = ?';
                    } else {
                        res.json({status: 'ERR_WRONG_DATA_TYPE'});
                        return;
                    }
                    let [result, fields] = await pool.query(query, params);

                }
                 else {
                    // INSERT images
                    let query = "INSERT INTO t_images (i_type, i_path, i_target_id, i_data_type) VALUES (?, ?, ?, ?)";
                    let params = [type, reImagePath, targetId, dataType];
                    let [result, fields] = await pool.query(query, params);
                }
                res.json({ status: 'OK', reImagePath: reImagePath });
            });

        });
    });

});
//이미지 삭제
router.post('/delete/image', async (req, res) => {
    let deleteList = req.body.deleteList;

    if (f.isNone(deleteList)) {
        res.json({status: 'ERR_WRONG_PARAM'});
        return;
    }

    let imageCnt = 0;
    let query = 'DELETE FROM t_images WHERE';

    deleteList.forEach((item, index) => {
        let originImagePath = `${item.path.split('.')[0]}_original.${item.path.split('.')[1]}`;
        fs.unlinkSync(`public${item.path}`);
        fs.unlinkSync(`public${originImagePath}`);

        if (item.type !== 'THUMB') {
            if (index == deleteList.length - 1) query += ` i_id = ${item.iId}`;
            else query += ` i_id = ${item.iId} OR`;
            imageCnt++;
        }

    });
    if (imageCnt > 0) {
        let [result, fields] = await pool.query(query);
    }
    res.json({status: 'OK'});
});


router.get('/notice/get/all', async (req, res) => {
    let query = "SELECT * FROM t_notices ORDER BY no_created_date DESC";
    let [result, fields] = await pool.query(query);
    res.json({ status: 'OK', result: result });
});


router.post('/notice/delete', async (req, res) => {
    let noId = req.body.noId;

    let query = "DELETE FROM t_notices WHERE no_id = ?";
    let params = [noId];
    await pool.query(query, params);

    res.json({ status: 'OK' });
});


router.post('/notice/save', async (req, res) => {

    let mode = req.body.mode;
    let title = req.body.title;
    let contents = req.body.contents;
    let noId = req.body.noId;

    let query = "";
    let params = [];

    if (mode == 'ADD') {
        query = "INSERT INTO t_notices (no_title, no_contents) VALUES (?, ?)";
        params = [title, contents];

    } else {
        query = "UPDATE t_notices SET no_title = ?, no_contents = ?, no_updated_date = NOW() WHERE no_id = ?";
        params = [title, contents, noId];
    }

    await pool.query(query, params);
    res.json({ status: 'OK' });
});


router.get('/notice/get', async (req, res) => {
    let noId = req.query.noId;
    let query = "SELECT * FROM t_notices WHERE no_id = ?";
    let params = [noId];
    let [result, fields] = await pool.query(query, params);
    if (result.length == 0) {
        res.json({ status: 'ERR_NO_NOTICE' });
        return;
    }
    res.json({ status: 'OK', result: result[0] });
});


router.get('/question/get/all', async (req, res) => {
    let query = "SELECT * FROM t_questions AS qTab";
    query += " JOIN t_users AS uTab ON uTab.u_id = qTab.q_u_id";
    query += " ORDER BY qTab.q_created_date ASC";
    let [result, fields] = await pool.query(query);
    res.json({ status: 'OK', result: result });
});


router.get('/question/get', async (req, res) => {
    let qId = req.query.qId;
    let query = "SELECT * FROM t_questions AS qTab";
    query += " JOIN t_users AS uTab ON uTab.u_id = qTab.q_u_id";
    query += " WHERE qTab.q_id = ?";
    let params = [qId];
    let [result, fields] = await pool.query(query, params);
    res.json({ status: 'OK', result: result[0] });
});


router.post('/question/answer', async (req, res) => {
    let qId = req.body.qId;
    let answer = req.body.answer;

    let query = "UPDATE t_questions SET q_status = 'A', q_answer = ?, q_answered_date = NOW() WHERE q_id = ?";
    let params = [answer, qId];
    await pool.query(query, params);

    res.json({ status: 'OK' });
});


module.exports = router;
