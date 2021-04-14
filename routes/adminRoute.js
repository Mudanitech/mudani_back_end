const router = require('express').Router()
const adminController = require('../controllers/adminController');
const thematicController = require('../controllers/thematicController');
const modelController = require('../controllers/modelController');
const questionnaireController = require('../controllers/questionnaireController');
const planController = require('../controllers/planController');
const authHandler = require('../authHandler/auth');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();



router.post('/adminLogin', adminController.adminLogin);
router.post('/saveEmail', adminController.saveEmail);
router.get('/waitList', adminController.waitList);
router.post('/sendEmail', adminController.sendEmail);
router.post('/sendSMS', adminController.sendSMS);
router.get('/referDetails/:id', adminController.referDetails);
router.get('/referList', adminController.referList);
router.post('/appLink', adminController.appLink);

router.post('/createUser', adminController.createUser);

router.post('/createThematic', thematicController.createThematic);
router.get('/thematicList', thematicController.thematicList);
// router.use(authHandler.appAuth);
router.get('/thematicDetail/:id', thematicController.thematicDetail);

router.post('/createModel', modelController.createModel);
router.get('/modelList', modelController.modelList);
router.get('/modelDetail/:id', modelController.modelDetail);

router.post('/addQuestionnaire', questionnaireController.addQuestionnaire);
router.get('/questionnaireList', questionnaireController.questionnaireList);
router.delete('/deleteQuestionnaire/:id', questionnaireController.deleteQuestionnaire);
router.get('/getQuestionaireDetail/:id', questionnaireController.getQuestionaireDetail);
router.post('/addPlan', planController.addPlan);

router.post('/uploadImage', multipartMiddleware, thematicController.uploadImage);

module.exports = router;