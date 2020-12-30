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


module.exports = router;
