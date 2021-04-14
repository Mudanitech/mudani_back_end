const router = require('express').Router()

const userController = require('../controllers/user/userController');
const authHandler = require('../authHandler/auth');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.post('/checkUserMobileNo', userController.checkUserMobileNo);
router.post('/checkUserEmail', userController.checkUserEmail);
router.post('/createUser', userController.createUser);
router.get('/getApplicationForm/:id', userController.getApplicationForm);
router.post('/createApplication', userController.createApplication);
router.post('/giveMultipleAnswer', userController.giveMultipleAnswer);
router.post('/giveSingleAnswer', userController.giveSingleAnswer);
router.post('/applicationSubmit', userController.applicationSubmit);
router.get('/getQuestionnaire', userController.getQuestionnaire);
router.post('/getStateList', userController.getStateList);
router.post('/getCountryList', userController.getCountryList);
router.post('/login', userController.login);
router.post('/resetPassword', userController.resetPassword);
router.post('/createOtp', userController.createOtp);
router.post('/changePassword', userController.changePassword);
router.get('/getPlans', userController.getPlans);

router.post('/createPlaidToken', userController.createPlaidToken);
router.post('/getAccessToken', userController.getAccessToken);

router.post('/createJws', userController.createJws);


// router.post('/uploadImage', multipartMiddleware, thematicController.uploadImage);

module.exports = router;