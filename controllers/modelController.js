const Model = require('../models/modelModel');
const response = require('../utils/response');
const orbisControllerRequest = require('../controllers/orbis/orbisController');
const Joi = require('joi');

const createModel = async (req, res) => {
    try {

        const schema = Joi.object({
            orbisModelId: Joi.required(),
            type: Joi.required(),
            modelName: Joi.string().required(),
            maximumDeviationAllowance: Joi.string().required(),
            adjustedFrequency: Joi.string().required(),
            // existingModel: Joi.string(),
            description: Joi.string().required(),
        });

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let modelObj = new Model({
            orbisModelId: req.body.orbisModelId,
            type: req.body.type,
            modelName: req.body.modelName,
            maximumDeviationAllowance: req.body.maximumDeviationAllowance,
            adjustedFrequency: req.body.adjustedFrequency,
            description: req.body.description,
        })
        let data = await modelObj.save();
        return response.responseHandlerWithMessage(res, 200, "Model Added Successfully");
    } catch (error) {
        response.log("error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const modelList = async (req, res) => {
    try {
        let result = await Model.find({})
        response.responseHandlerWithData(res, 200, "Model List", result);
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const modelDetail = async (req, res) => {
    try {

        var mongodb = require("mongodb")
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");
        //console.log('req.params.thematicId', req.params.id);
        let result = await Model.findOne({ _id: req.params.id })
        if (result) response.responseHandlerWithData(res, 200, "Model Detail", result);
        else response.responseHandlerWithData(res, 201, "Data not found", {});
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const addModelHolding = async (req, res) => {
    try {
        const schema = Joi.object({
            model_id: Joi.string().min(3).max(30).required(),
            models: Joi.required(),
            symbol: Joi.required()
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Model.findById(req.body.model_id);

        if (!result) {
            return response.responseHandlerWithMessage(res, 201, "Models Not Added");
        }
        let checkTicker = await Model.findOne({ "_id": req.body.model_id, "models.symbol": req.body.symbol });
        // console.log('checkTickercheckTickercheckTicker', checkTicker)
        if (checkTicker) {
            return response.responseHandlerWithMessage(res, 201, "Ticker is already added.");
        }
        result.models.push(req.body.models);
        result.save();
        return response.responseHandlerWithMessage(res, 200, "Holding Added Successfully");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const deleteModelHolding = async (req, res) => {
    try {
        const schema = Joi.object({
            model_id: Joi.string().min(3).max(30).required(),
            symbol: Joi.required()
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Model.findById(req.body.model_id);

        if (!result) {
            return response.responseHandlerWithMessage(res, 201, "Models Not Added");
        }

        await Model.findByIdAndUpdate(req.body.model_id, { $pull: { models: { "symbol": req.body.symbol } } });

        return response.responseHandlerWithMessage(res, 200, "Holding Deleted Successfully");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const deleteModel = async (req, res) => {
    try {
        const schema = Joi.object({
            model_id: Joi.string().min(3).max(30).required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Model.findById(req.body.model_id);

        if (!result) {
            return response.responseHandlerWithMessage(res, 201, "Models Not Added");
        }

        await Model.findOneAndDelete(req.body.model_id);

        return response.responseHandlerWithMessage(res, 200, "Models Deleted Successfully");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getOrbisTicker = async (req, res) => {
    try {
        let getOrbisTicker = await orbisControllerRequest.getOrbisTicker(req);
        if (!getOrbisTicker[0]) {
            response.responseHandlerWithMessage(res, 201, "Ticker not available");
        }
        console.log('getOrbisTickergetOrbisTicker', getOrbisTicker[0].symbol)
        let ticketData = await orbisControllerRequest.getOrbisStockImage(getOrbisTicker[0].symbol);
        if (ticketData.logo_square) {
            console.log('ticketData', ticketData)
            getOrbisTicker['ticker_image'] = ticketData.logo_square
        } else {
            console.log('ticketData', ticketData)
            getOrbisTicker['ticker_image'] = ""
        }

        response.responseHandlerWithData2(res, 200, "Ticker List", getOrbisTicker, ticketData);

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getOrbisModels = async (req, res) => {
    try {
        let newsList = await orbisControllerRequest.getOrbisModels(req);
        response.responseHandlerWithData(res, 200, "Ticker List", newsList);

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

module.exports = {
    createModel,
    modelList,
    modelDetail,
    addModelHolding,
    deleteModelHolding,
    deleteModel,
    getOrbisTicker,
    getOrbisModels
}
