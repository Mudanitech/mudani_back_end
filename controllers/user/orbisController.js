
const response = require('../../utils/response');
const Joi = require('joi');

var jws = require("jws");
const got = require('got');
const uuidv4 = require('uuid/v4');
const ini = require('ini');
const fs = require('fs');
const fetch = require('node-fetch');


// const config = ini.parse(fs.readFileSync('c2c.properties', 'utf-8'));
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
    },
    secret: "Zq4t7w!z%C*F-JaNdRgUkXp2r5u8x/A?"
});

console.log('keykeykeykeykeykey', key)
console.log(Math.floor(Date.now() / 1000), Math.floor((Date.now() + 60 * 1000) / 1000))




const createJws = async (req, res) => {
    try {
        let orbisApi = await fetch('https://wrh.orbisfn.net/c2c/jws.action?jws=' + key)
            .then((res) => res.json());
        let token = orbisApi.token;


        let getModels = await fetch("https://wrh.orbisfn.net/api/v2/advisory/models", {
            method: "get",
            headers: { "Content-Type": "application/json", Authorization: 'C2C ' + Buffer.from(token).toString('base64') },
        })
            .then((res) => res.json());
        console.log('getModels', Buffer.from(token).toString('base64'))
        return response.responseHandlerWithData(res, 200, "Models List", getModels);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}


module.exports = {
    createJws
}
