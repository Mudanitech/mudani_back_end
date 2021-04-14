const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',
    // port: '465',
    // secure: true, // use SSL
    // auth: {
    //     type: 'OAuth2',
    //     user: 'support@mudani.com',
    //     // pass: 'Corona3435',
    //     serviceClient: '119253772784-7ejercl269qhku5i3mhk1gt78tpc2m2u.apps.googleusercontent.com',
    //     privateKey: 'zDuPIqzVYAUAH_stK8OXF4Fw',
    // }

    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: 'support@mudani.com',
        clientId: '119253772784-7ejercl269qhku5i3mhk1gt78tpc2m2u.apps.googleusercontent.com',
        clientSecret: 'zDuPIqzVYAUAH_stK8OXF4Fw',
        refreshToken: "1//04dGvrkzpEj0ACgYIARAAGAQSNwF-L9IrPOQCXfX_uL3J8UiJqs6qLm89eBGNxTnCqQFkiwPsNDJoh2uIVXoKAVwotcv3O2oxDMk",
        accessToken: "ya29.A0AfH6SMApBAdgTO7pKs_tc4hTpb6QcXmLOkYB1XFczJf9eCCZuTuZto1UJwoAxVFcN9vGsWvFMcC_6CExIm6YnCFXqIKVxqkjwF-oqBZYY41XtFz87j-UqhVlkvQHUcWqBsyHjPG-6SjoIrEATuvkw0bcxfgt"
    }
});

const sendEmail = (from, to, subject, html) => {
    let mailOptions = {
        from: 'support@mudani.com',
        to,
        subject,
        html,
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log('err', err)
                reject(err);
            } else {
                console.log('info', info)
                resolve(info);
            }
        })
    })
}

module.exports = {
    sendEmail
}