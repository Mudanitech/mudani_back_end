
const response = require('../../utils/response');
const Joi = require('joi');

var jws = require("jws");
// const got = require('got');
const uuidv4 = require('uuid/v4');
// const ini = require('ini');
// const fs = require('fs');
const fetch = require('node-fetch');

const APP_ORBIS_URL = "https://wrh.orbisfn.net/api/"
const APP_ORBIS_TICKER_LOGO = "https://logos-api.orbisfn.io/api/"

// const config = ini.parse(fs.readFileSync('c2c.properties', 'utf-8')); 



const createOrbisToken = async () => {
    try {
        const key = jws.sign({
            header: {
                alg: 'HS256'
            },
            payload: {
                jti: uuidv4(),
                iss: 'Sample API v1.0',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor((Date.now() + 60 * 1000) / 1000),
                entity: "mudaniuat",
                // group: "uat"
                group: "advisory"
            },
            secret: "Zq4t7w!z%C*F-JaNdRgUkXp2r5u8x/A?"
        });

        console.log('keykeykeykeykeykey', key)
        console.log(Math.floor(Date.now() / 1000), Math.floor((Date.now() + 60 * 1000) / 1000))

        let orbisApi = await fetch('https://wrh.orbisfn.net/c2c/jws.action?jws=' + key)
            .then((res) => res.json());
        let token = orbisApi.token;
        return token;
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const createOrbisTokenForUAT = async () => {
    try {
        const key = jws.sign({
            header: {
                alg: 'HS256'
            },
            payload: {
                jti: uuidv4(),
                iss: 'Sample API v1.0',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor((Date.now() + 60 * 1000) / 1000),
                entity: "mudaniuat",
                group: "uat"
                // group: "advisory"
            },
            secret: "Zq4t7w!z%C*F-JaNdRgUkXp2r5u8x/A?"
        });

        console.log('keykeykeykeykeykey', key)
        console.log(Math.floor(Date.now() / 1000), Math.floor((Date.now() + 60 * 1000) / 1000))

        let orbisApi = await fetch('https://wrh.orbisfn.net/c2c/jws.action?jws=' + key)
            .then((res) => res.json());
        let token = orbisApi.token;
        return token;
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getOrbisModels = async (req, res) => {
    try {
        const token = await createOrbisToken();
        console.log('CreatedToken', token)
        let getModels = await fetch("https://wrh.orbisfn.net/api/v2/advisory/models", {
            // let getModels = await fetch("https://wrh.orbisfn.net/api/v2/advisory/model/portfolios/1109", {
            // let getModels = await fetch("api/v2/advisory/model/position/equity/1109?GOOGL", {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());

        // let getModels = await fetch("https://wrh.orbisfn.net/api/orders/v2/preview/equity", {
        //     method: "post",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // }) 
        //     .then((res) => res.json());



        // let getModels = await fetch("https://wrh.orbisfn.net/api/user/account", {
        //     method: "post",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // })
        //     .then((res) => res.json());



        // let getModels = await fetch("https://wrh.orbisfn.net/api/symbol/IBM", {
        //     method: "get",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // })
        //     .then((res) => res.json());



        // let getModels = await fetch("https://wrh.orbisfn.net/api/quotes/equity?symbols=IBM", {
        //     method: "get",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // })
        //     .then((res) => res.json());
        console.log('getModels', Buffer.from(token).toString('base64'))
        return getModels;
        return response.responseHandlerWithData(res, 200, "preview", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getOrbisTicker = async (req, res) => {
    try {
        const token = await createOrbisToken();
        console.log('CreatedToken', token)

        let getModels = await fetch("https://wrh.orbisfn.net/api/quotes/equity?symbols=" + req.body.ticker, {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());
        console.log('getModels', Buffer.from(token).toString('base64'))
        return getModels;
        return response.responseHandlerWithData(res, 200, "Models List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getAllNewsList = async (req, res) => {
    try {
        const token = await createOrbisToken();
        // console.log('myToken', token)
        let getModels = await fetch(APP_ORBIS_URL + "research/news", {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());

        return getModels;
        return response.responseHandlerWithData(res, 200, "News List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getNewsListBySymbol = async (req) => {
    try {
        const token = await createOrbisToken();
        // console.log('CreatedToken', token)
        let getModels = await fetch(APP_ORBIS_URL + "research/news/ticker/" + req, {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());

        return getModels;
        return response.responseHandlerWithData(res, 200, "News List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getOrbisTopStockList = async (req) => {
    try {
        const token = await createOrbisToken();
        // console.log('CreatedToken', token)
        let getModels = await fetch(APP_ORBIS_URL + "quotes/top10/LP?market=BIG3&order=H&count=10", {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());

        return getModels;
        return response.responseHandlerWithData(res, 200, "News List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getOrbisStockImage = async (symbol) => {
    try {
        const token = await createOrbisToken();
        // console.log('CreatedToken', token)
        let getModels = await fetch(APP_ORBIS_TICKER_LOGO + "symbol/" + symbol, {
            method: "get",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json());

        return getModels;
        return response.responseHandlerWithData(res, 200, "News List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getOrbisHistoricalData = async (data) => {
    try {
        const token = await createOrbisToken();
        // console.log('CreatedToken', token)
        let getModels = await fetch(APP_ORBIS_URL + "quotes/equity/historical?symbol=" + data.ticker + "&start=" + data.startDate + "&end=" + data.endDate + "&range&setWeekly&rsiSpan", {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());
        // console.log('getModelsgetModelsgetModels', data)
        return getModels;
        return response.responseHandlerWithData(res, 200, "News List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const orbisStockPlacement = async (req, res) => {
    try {
        const token = await createOrbisTokenForUAT();
        let jsonBody = JSON.stringify({
            "requireNbbo": true,
            "account": {
                "accountNumber": "6BM05007"
            },
            "order": {
                "quote": {
                    "symbol": req.body.ticker
                },
                "orderType": "MARKET",
                "transaction": "BUY",
                "fillType": "ANY",
                "validity": "DAY",
                "limitPrice": 1,
                "stopPrice": 1,
                "quantity": 1,
                "marketTime": "CORE_MARKET"
            }
        });
        let getModels = await fetch(APP_ORBIS_URL + "orders/v2/preview/equity", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());
        // return orbisApi;




        // let getModels = await fetch("https://wrh.orbisfn.net/api/user/account", {
        //     method: "post",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // })
        //     .then((res) => res.json());



        // let getModels = await fetch("https://wrh.orbisfn.net/api/symbol/IBM", {
        //     method: "get",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // })
        //     .then((res) => res.json());



        // let getModels = await fetch("https://wrh.orbisfn.net/api/quotes/equity?symbols=IBM", {
        //     method: "get",
        //     headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        // })
        //     .then((res) => res.json());
        console.log('getModels', Buffer.from(token).toString('base64'))
        return getModels;
        return response.responseHandlerWithData(res, 200, "preview", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

module.exports = {
    getOrbisModels,
    getOrbisTicker,
    getAllNewsList,
    getNewsListBySymbol,
    getOrbisTopStockList,
    getOrbisStockImage,
    orbisStockPlacement,
    getOrbisHistoricalData
}
