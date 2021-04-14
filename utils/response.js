
module.exports = {
    responseHandlerWithMessage: (res, code, message) => {
        res.send({ status: code, message, });
    },
    responseHandlerWithData: (res, code, message, data) => {
        res.send({ status: code, message, data });
    },
    log(message = '', data = "") {
        console.log(message, data)
    },


}