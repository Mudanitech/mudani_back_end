const Thematic = require('../models/thematicModel');
const response = require('../utils/response');
const fileupload = require('../utils/fileupload');
const Joi = require('joi');
const fs = require('fs');
var mongodb = require("mongodb")

const createThematic = async (req, res) => {
    try {
        const schema = Joi.object({
            modelId: Joi.string().required(),
            thematicName: Joi.string().min(3).max(30).required(),
            thematicDescription: Joi.string().required(),
            thematicImage: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let thematicObj = new Thematic({
            modelId: req.body.modelId,
            thematicName: req.body.thematicName,
            thematicDescription: req.body.thematicDescription,
            thematicImage: req.body.thematicImage,
            thematicStatus: 1
        })
        let data = await thematicObj.save();
        return response.responseHandlerWithMessage(res, 200, "Thematic Added Successfully");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const thematicList = async (req, res) => {
    try {
        // let result = await Thematic.find({})
        const data = await Thematic
            .aggregate([
                { $match: { $or: [{ "thematicStatus": '1' }, { "thematicStatus": 1 }] } },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1 } },

                            // { $project: { _id: 1, answer: 1 } },
                        ],
                        as: 'models'
                    }
                }
            ])

        response.responseHandlerWithData(res, 200, "Thematic List", data);
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const thematicDetail = async (req, res) => {
    try {

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        const result = await Thematic
            .aggregate([
                { $match: { _id: mongodb.ObjectID(req.params.id), $or: [{ "thematicStatus": '1' }, { "thematicStatus": 1 }] } },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1, models: 1, } },

                            // { $project: { _id: 1, answer: 1 } },
                        ],
                        as: 'models'
                    }
                }
            ])


        // let result = await Thematic.findOne({ _id: req.params.id })
        if (result) response.responseHandlerWithData(res, 200, "Thematic Detail", result);
        else response.responseHandlerWithData(res, 201, "Data not found", {});
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const editThematic = async (req, res) => {
    try {
        const schema = Joi.object({
            thematicId: Joi.string().required(),
            modelId: Joi.string().required(),
            thematicName: Joi.string().min(3).max(30).required(),
            thematicDescription: Joi.string().required(),
            // thematicImage: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let thematicObj = {
            modelId: req.body.modelId,
            thematicName: req.body.thematicName,
            thematicDescription: req.body.thematicDescription,
            // thematicImage: req.body.thematicImage,
            thematicStatus: 1
        }
        var saveQuestion = await Thematic.findByIdAndUpdate({ _id: req.body.thematicId }, thematicObj, { new: true });
        if (saveQuestion) {
            return response.responseHandlerWithMessage(res, 200, "Thematic Updated Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const uploadImage = async function (req, res) {

    // console.log('req.files.image', req.files.image);

    const image = await fileupload.imageUpload(req.files.image);
    //console.log('image', image)
    return response.responseHandlerWithData(res, 200, "Image Uploaded", image);
}


module.exports = {
    createThematic,
    thematicList,
    thematicDetail,
    editThematic,
    uploadImage
}
