const router = require('express').Router()
const orbisController = require('../controllers/user/orbisController');



router.post('/createJws', orbisController.createJws);


module.exports = router;