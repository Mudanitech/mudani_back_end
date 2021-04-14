const response = require('../utils/response');
const fetch = require('node-fetch');
const config = require('../config/config');


const generateJWT = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "with": [
                "user"
            ],
            "email": "admin@mudani.com",
            "password": "9UfqXCmtxmMR53gx"

        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/auth/login", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json());
        // orbisApi = orbisApi.login.token.access_token;
        // console.log('orbisApi', orbisApi.login.token.access_token)
        // console.log('orbisApi', orbisApi)
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const registerUser = async (req, res) => {
    try {
        let branchId = 0;
        if (req.interestedAccount == 1) {
            branchId = 47;        //self direct account
        } else {
            branchId = 48;        //managed account
        }
        let jsonBody = JSON.stringify({
            "role": "applicant",
            "branch_id": branchId,
            "first_name": req.firstName,
            "last_name": req.lastName,
            "email": req.email,
            "password": req.password
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/users/create", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        // orbisApi = orbisApi.login.token.access_token;
        // console.log('orbisApi', orbisApi.login.token.access_token)
        // console.log('orbisApi', orbisApi)
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createForm = async (req, res) => {
    try {

        let jsonBody = JSON.stringify({
            "with": [
                "translations"
            ]
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/applications/get-application-types", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getForm = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "with": [
                "pages.translations",
                "pages.sections.translations",
                "pages.sections.questions.translations",
                "pages.sections.questions.parent_questions.question",
                "pages.sections.questions.parent_questions.option",
                "pages.sections.questions.rule_set.rules.values",
                "pages.sections.questions.type",
                "pages.sections.questions.document_type",
                "pages.sections.questions.description.translations",
                "pages.sections.questions.options.translations",
                "pages.sections.questions.options.description.translations",
                "pages.sections.questions.options.alert.translations",
                "pages.sections.questions.options.parent_options.question",
                "pages.sections.questions.options.parent_options.option",
                "translations"
            ],
            "application_type_id": req.application_types_id
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/applications/get-form", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        console.log('orbisApiorbisApiorbisApiorbisApi', orbisApi)
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createApplication = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "with": ["timestamps"],
            "user_id": req.orbisUserId
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/applications/create", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const giveMultipleAnswer = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "application_id": req.application_id,
            "answers": req.answers
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/applications/answer-multiple", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const giveSingleAnswer = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "application_id": req.application_id,
            'question_id': req.question_id,
            "data": req.answers
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/applications/answer", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const applicationSubmit = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "application_id": req.application_id
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/applications/submit", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getStateList = async (req, res) => {
    try {
        // let jsonBody = JSON.stringify({
        //     "application_id": req.application_id
        // });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/states/list", {
            method: "post",
            body: "",
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getCountryList = async (req, res) => {
    try {
        let jsonBody = JSON.stringify({
            "with": ["timestamps"]
        });
        let orbisApi = await fetch(config.orbisBaseUrl + "api/countries/list", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", "Authorization": "bearer " + req.orbisToken },
        })
            .then((res) => res.json());
        return orbisApi;


    } catch (error) {
        response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

module.exports = {
    generateJWT,
    registerUser,
    createForm,
    getForm,
    createApplication,
    giveMultipleAnswer,
    giveSingleAnswer,
    applicationSubmit,
    getStateList,
    getCountryList
}
