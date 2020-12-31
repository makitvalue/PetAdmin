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


module.exports = router;
