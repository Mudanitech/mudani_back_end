const Thematic = require('../models/thematicModel');
const response = require('../utils/response');
const fileupload = require('../utils/fileupload');
const Joi = require('joi');
const fs = require('fs');


const createThematic = async (req, res) => {
    try {
        const schema = Joi.object({
            thematicName: Joi.string().min(3).max(30).required(),
            thematicDescription: Joi.string().min(30).required(),
            thematicImage: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let thematicObj = new Thematic({
            thematicName: req.body.thematicName,
            thematicDescription: req.body.thematicDescription,
            thematicImage: req.body.thematicImage,
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
        let result = await Thematic.find({})
        response.responseHandlerWithData(res, 200, "Thematic List", result);
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const thematicDetail = async (req, res) => {
    try {

        var mongodb = require("mongodb")
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");
        //console.log('req.params.thematicId', req.params.id);
        let result = await Thematic.findOne({ _id: req.params.id })
        if (result) response.responseHandlerWithData(res, 200, "Thematic Detail", result);
        else response.responseHandlerWithData(res, 201, "Data not found", {});
    } catch (error) {
        response.log("error is ==========>", error)
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
    uploadImage
}
