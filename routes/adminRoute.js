const router = require('express').Router()
const adminController = require('../controllers/adminController');
const thematicController = require('../controllers/thematicController');
const modelController = require('../controllers/modelController');
const questionnaireController = require('../controllers/questionnaireController');
const portfolioController = require('../controllers/portfolioController');
const planController = require('../controllers/planController');

const orbisController = require('../controllers/orbis/orbisController');

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
router.post('/editThematic', thematicController.editThematic);
router.get('/thematicList', thematicController.thematicList);
// router.use(authHandler.appAuth);
router.get('/thematicDetail/:id', thematicController.thematicDetail);

router.post('/createModel', modelController.createModel);
router.get('/modelList', modelController.modelList);
router.get('/modelDetail/:id', modelController.modelDetail);
router.post('/addModelHolding', modelController.addModelHolding);
router.post('/deleteModelHolding', modelController.deleteModelHolding);
router.post('/deleteModel', modelController.deleteModel);

router.post('/createPortfolio', portfolioController.createPortfolio);
router.get('/portfolioList', portfolioController.portfolioList);
router.get('/portfolioDetail/:id', portfolioController.portfolioDetail);
router.post('/editPortfolio', portfolioController.editPortfolio);

router.post('/addQuestionnaire', questionnaireController.addQuestionnaire);
router.post('/editQuestionnaire', questionnaireController.editQuestionnaire);
router.get('/questionnaireList', questionnaireController.questionnaireList);
router.post('/enableQuestionare', questionnaireController.enableQuestionare);
router.delete('/deleteQuestionnaire/:id', questionnaireController.deleteQuestionnaire);
router.get('/getQuestionaireDetail/:id', questionnaireController.getQuestionaireDetail);
router.get('/getQuestionairePortfolio/:id', questionnaireController.getQuestionairePortfolio);
router.post('/addPlan', planController.addPlan);

router.post('/uploadImage', multipartMiddleware, thematicController.uploadImage);


router.get('/getOrbisModels', modelController.getOrbisModels);
router.post('/getOrbisTicker', modelController.getOrbisTicker);
router.post('/addTicker', questionnaireController.addTicker);
router.get('/getTickerList', questionnaireController.getTickerList);
router.post('/assignedPortfolio', questionnaireController.assignedPortfolio);
router.post('/deletePortfolio', questionnaireController.deletePortfolio);

module.exports = router;