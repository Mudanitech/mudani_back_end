const Plan = require('../models/planModel');
const response = require('../utils/response');
const Joi = require('joi');

const addPlan = async (req, res) => {
    try {
        const schema = Joi.object({
            type: Joi.string().required(),
            name: Joi.string().required(),
            price: Joi.number().required(),
            duration: Joi.string().required(),
            bill_time: Joi.string().required(),
            description: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);


        // let itemArr = [];

        // let reqData = JSON.parse(req.body.features);
        // reqData.forEach(async function (question, index, arr) {
        //     itemArr.push((question))
        // })
        let planObj = new Plan({
            type: req.body.type,
            name: req.body.name,
            price: req.body.price,
            duration: req.body.duration,
            bill_time: req.body.bill_time,
            description: req.body.description,
        })
        let addPlan = await planObj.save();
        if (addPlan) {
            return response.responseHandlerWithMessage(res, 200, "Plan Added Successfully");
        } else {
            return response.responseHandlerWithData(res, 500, "Internal Server Error");
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

module.exports = {
    addPlan
}
