
module.exports = {
    responseHandlerWithMessage: (res, code, message) => {
        res.send({ status: code, message, });
    },
    responseHandlerWithData: (res, code, message, data) => {
        res.send({ status: code, message, data });
    },
    responseHandlerWithData2: (res, code, message, data, result) => {
        res.send({ status: code, message, data, result });
    },
    log(message = '', data = "") {
        console.log(message, data)
    },


}