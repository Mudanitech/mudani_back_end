const router = require('express').Router()

const userController = require('../controllers/user/userController');
const authHandler = require('../authHandler/auth');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.post('/checkUserMobileNo', userController.checkUserMobileNo);
router.post('/checkUserEmail', userController.checkUserEmail);
router.post('/createUser', userController.createUser);

router.post('/getStateList', userController.getStateList);
router.post('/getCountryList', userController.getCountryList);
router.post('/login', userController.login);
router.post('/resetPassword', userController.resetPassword);
router.post('/createOtp', userController.createOtp);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/changePassword', userController.changePassword);
router.get('/deleteUser/:countryCode/:mobile', userController.deleteUser);

// router.use(authHandler.appAuth);

router.get('/getApplicationForm/:id', userController.getApplicationForm);
router.get('/getApplicationStatus/:appId/:userId', userController.getApplicationStatus);
router.post('/createApplication', userController.createApplication);
router.post('/giveMultipleAnswer', userController.giveMultipleAnswer);
router.post('/giveSingleAnswer', userController.giveSingleAnswer);
router.post('/applicationSubmit', userController.applicationSubmit);
router.get('/getQuestionnaire', userController.getQuestionnaire);
router.post('/getSuggestedPortfolio', userController.getSuggestedPortfolio);
router.get('/getAllSuggestedPortfolio', userController.getAllSuggestedPortfolio);



router.get('/getPlans', userController.getPlans);
router.post('/choosePlans', userController.choosePlans);
router.get('/getPopularStock/:id', userController.getPopularStock);
router.post('/createBasket', userController.createBasket);
router.post('/createPortfolio', userController.createPortfolio);
router.get('/getThematicBasket', userController.getThematicBasket);
router.post('/createThematicBasket', userController.createThematicBasket);

router.post('/createPlaidToken', userController.createPlaidToken);
router.post('/getAccessToken', userController.getAccessToken);

router.post('/createJws', userController.createJws);

router.get('/userDashboard/:id', userController.userDashboard);
router.get('/getMyPlans/:id/:type', userController.getMyPlans);
router.get('/getMyPortfolio/:id', userController.getMyPortfolio);
router.get('/getMyAccountInfo/:id', userController.getMyAccountInfo);
router.post('/updateAccountInfo', userController.updateAccountInfo);
router.post('/upgradePlan', userController.upgradePlan);
router.post('/cancelPlan', userController.cancelPlan);
router.post('/cancelBasket', userController.cancelBasket);

router.get('/getNewsList', userController.getNewsList);
router.get('/getNewsListBySymbol/:symbol', userController.getNewsListBySymbol);
router.get('/getNewsDetail/:newsId', userController.getNewsDetail);
router.post('/tickerDetail', userController.tickerDetail);
router.get('/getTopStockList', userController.getTopStockList);
router.get('/getStockImage/:symbol', userController.getStockImage);
router.post('/searchTicker', userController.searchTicker);
router.post('/getHistoricalData', userController.getHistoricalData);


router.post('/stockPlacement', userController.stockPlacement);
router.post('/profileMarkAsUpdate', userController.profileMarkAsUpdate);
router.post('/getWheelStock', userController.getWheelStock);
router.post('/updateScreenStatue', userController.updateScreenStatue);
router.post('/updateJourneyStatus', userController.updateJourneyStatus);

router.get('/userNotification/:id', userController.userNotification);
router.get('/seenNotification/:id', userController.seenNotification);
router.post('/createPin', userController.createPin);
router.post('/loginByPin', userController.loginByPin);
router.post('/basketByExecution', userController.basketByExecution);



// router.post('/uploadImage', multipartMiddleware, thematicController.uploadImage);

module.exports = router;