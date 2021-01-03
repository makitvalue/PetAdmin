var express = require('express');
var router = express.Router();
const pool = require('../lib/database');


router.get('/', (req, res) => {
    res.render('index', { 
        menu: 'main'
    });
});


router.get('/nutrient', (req, res) => {
    res.render('index', { 
        menu: 'nutrient'
    });
});


router.get('/nutrient/add', (req, res) => {
    res.render('index', { 
        menu: 'nutrient_add'
    });
});


router.get('/nutrient/detail/:nId', (req, res) => {
    res.render('index', { 
        menu: 'nutrient_detail',

        nId: req.params.nId
    });
});


router.get('/food', (req, res) => {
    res.render('index', { 
        menu: 'food'
    });
});


router.get('/food/add', (req, res) => {
    res.render('index', { 
        menu: 'food_add'
    });
});


router.get('/food/detail/:fId', (req, res) => {
    res.render('index', { 
        menu: 'food_detail',

        fId: req.params.fId
    });
});


router.get('/disease', (req, res) => {
    res.render('index', { 
        menu: 'disease'
    });
});


router.get('/disease/add', (req, res) => {
    res.render('index', { 
        menu: 'disease_add'
    });
});


router.get('/disease/detail/:dId', (req, res) => {
    res.render('index', { 
        menu: 'disease_detail',

        dId: req.params.dId
    });
});


router.get('/symptom', (req, res) => {
    res.render('index', { 
        menu: 'symptom'
    });
});


router.get('/symptom/add', (req, res) => {
    res.render('index', { 
        menu: 'symptom_add'
    });
});


router.get('/symptom/detail/:sId', (req, res) => {
    res.render('index', { 
        menu: 'symptom_detail',

        sId: req.params.sId
    });
});


router.get('/product', (req, res) => {
    res.render('index', { 
        menu: 'product'
    });
});


router.get('/product/add', (req, res) => {
    res.render('index', { 
        menu: 'product_add'
    });
});


router.get('/product/detail/:pId', async (req, res) => {
    let query = "SELECT * FROM t_products WHERE p_id = ?";
    let params = [pId];
    let [result, fields] = await pool.query(query, params);

    if (result.length == 0) {
        res.json({ status: 'ERR_NO_DATA' });
        return;
    }

    let pcId = result[0].pcId;
    let fnProt = '';
    let fnFat = '';
    let fnFibe = '';
    let fnAsh = '';
    let fnCalc = '';
    let fnPhos = '';
    let fnMois = '';
    if (pcId == 1) {
        query = "SELECT * FROM t_feed_nutrients WHERE fn_p_id = ?";
        [result, fields] = await pool.query(query, params);
        
        if (result.length == 0) {
            res.json({ status: 'ERR_NO_DATA' });
            return;
        }

        let feedNutrient = result[0];
        fnProt = feedNutrient.fn_prot;
        fnFat = feedNutrient.fn_fat;
        fnFibe = feedNutrient.fn_fibe;
        fnAsh = feedNutrient.fn_ash;
        fnCalc = feedNutrient.fn_calc;
        fnPhos = feedNutrient.fn_phos;
        fnMois = feedNutrient.fn_mois;
    }

    res.render('index', { 
        menu: 'product_detail',

        pId: req.params.pId,

        pcId: pcId,
        fnProt: fnProt,
        fnFat: fnFat,
        fnFibe: fnFibe,
        fnAsh: fnAsh,
        fnCalc: fnCalc,
        fnPhos: fnPhos,
        fnMois: fnMois
    });
});


router.get('/product/category', (req, res) => {
    res.render('index', { 
        menu: 'product_category'
    });
});


router.get('/product/brand', (req, res) => {
    res.render('index', { 
        menu: 'product_brand'
    });
});


router.get('/breed', (req, res) => {
    res.render('index', { 
        menu: 'breed'
    });
});


router.get('/breed/add', (req, res) => {
    res.render('index', { 
        menu: 'breed_add'
    });
});


router.get('/breed/detail/:bId', (req, res) => {
    res.render('index', { 
        menu: 'breed_detail',

        bId: req.params.bId
    });
});


router.get('/breed/weak/disease/:bagId', async (req, res) => {
    let bagId = req.params.bagId;

    let query = "SELECT * FROM t_breed_age_groups AS bagTab JOIN t_breeds AS bTab ON bTab.b_id = bagTab.bag_b_id WHERE bagTab.bag_id = ?";
    let params = [bagId];

    let [result, fields] = await pool.query(query, params);

    if (result.length == 0) {
        res.json({ status: 'ERR_NO_DATA' });
        return;
    }
    
    let bName = result[0].b_name;
    let bagMinAge = result[0].bag_min_age;
    let bagMaxAge = result[0].bag_max_age;

    res.render('index', { 
        menu: 'breed_weak_disease',

        bagId: bagId,

        bName: bName,
        bagMinAge: bagMinAge,
        bagMaxAge: bagMaxAge
    });
});


module.exports = router;
