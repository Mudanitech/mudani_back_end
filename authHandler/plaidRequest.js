const plaid = require('plaid');
const response = require('../utils/response');
// Initialize client
const client = new plaid.Client({
    clientID: "5f739c452412370011fa2fdd",
    secret: "421b61ce12b0ec852f26c2607076d6",
    env: plaid.environments.sandbox
});




const getTransaction = async (req, res) => {
    try {
        const clientUserId = req.body.userId;
        // Create the link_token with all of your configurations
        const tokenResponse = await client.createLinkToken({
            user: {
                client_user_id: clientUserId,
            },
            client_name: 'My App',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en',
            webhook: 'https://webhook.sample.com',
        });
        console.log({ link_token: tokenResponse.link_token });
        return tokenResponse;
    } catch (error) {
        // response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
        console.log(error)
        return false;
    }

}

const getPlaidAccessToken = async (req, res) => {
    try {
        let ACCESS_TOKEN = null;
        let PUBLIC_TOKEN = null;
        let ITEM_ID = null;
        PUBLIC_TOKEN = req.body.public_token;
        // client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
        //     if (error != null) {
        //         // prettyPrintResponse(error);
        //         return response.json({
        //             error,
        //         });
        //     }
        //     ACCESS_TOKEN = tokenResponse.access_token;
        //     console.log('ACCESS_TOKENACCESS_TOKEN', ACCESS_TOKEN)
        //     ITEM_ID = tokenResponse.item_id;
        //     // prettyPrintResponse(tokenResponse);
        //     return {
        //         access_token: ACCESS_TOKEN,
        //         item_id: ITEM_ID,
        //         error: null,
        //     };
        // });



        // client.getAccounts("access-sandbox-a38dc53b-9b71-4dd5-b8fb-e74792787dc5", function (error, tokenResponse) {
        //     if (error != null) {
        //         // prettyPrintResponse(error);
        //         return response.json({
        //             error,
        //         });
        //     }
        //     ACCESS_TOKEN = tokenResponse.access_token;
        //     console.log('ACCESS_TOKENACCESS_TOKEN', ACCESS_TOKEN)
        //     ITEM_ID = tokenResponse.item_id;
        //     // prettyPrintResponse(tokenResponse);
        //     return {
        //         access_token: ACCESS_TOKEN,
        //         item_id: ITEM_ID,
        //         error: null,
        //     };
        // });

        const tokenResponse = await client.getCreditDetails("access-sandbox-a38dc53b-9b71-4dd5-b8fb-e74792787dc5")
        console.log('tokenResponsetokenResponse', tokenResponse)
        return tokenResponse
    } catch (error) {
        // response.log("admin login error is=========>", error);
        // return response.responseHandlerWithData(res, 500, "Internal Server Error");
        console.log(error)
        return false;
    }

}

module.exports = {
    getTransaction,
    getPlaidAccessToken,
}
