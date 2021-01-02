var express = require('express');
var router = express.Router();


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


router.get('/product/detail/:pId', (req, res) => {
    res.render('index', { 
        menu: 'product_detail',

        pId: req.params.pId
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


module.exports = router;
