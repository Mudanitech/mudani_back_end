const Model = require('../models/modelModel');
const response = require('../utils/response');
const Joi = require('joi');

const createModel = async (req, res) => {
    try {

        const schema = Joi.object({
            modelName: Joi.string().min(3).max(30).required(),
            maximumDeviationAllowance: Joi.string().required(),
            adjustedFrequency: Joi.string().required(),
            // existingModel: Joi.string(),
            description: Joi.string().min(30).required(),
        });

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let modelObj = new Model({
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


module.exports = {
    createModel,
    modelList,
    modelDetail
}
