const https = require('https');
const fs = require('fs');


const express = require('express');
const mongoose = require('mongoose');
const route = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const orbisRoute = require('./routes/orbisRoute');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const morgan = require('morgan');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined'))
app.use(cors());

app.set('trust proxy', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const expressValidator = require('express-validator');
global.__basedir = __dirname;

mongoose.connect(`mongodb://127.0.0.1:27017/mudani`, { useNewUrlParser: true }, (err, result) => {
    if (err) {
        console.log("Error in connecting with database")
    }
    else {
        console.log('Mongoose connecting is setup successfully')
    }
});


process.on('uncaughtException', function (err) {
    console.log(err);
})

//==========================Request Console=======================//

app.all("*", (req, resp, next) => {
    let obj = {
        Host: req.headers.host,
        ContentType: req.headers['content-type'],
        Url: req.originalUrl,
        Method: req.method,
        Query: req.query,
        Body: req.body,
        Parmas: req.params[0]
    }
    console.log("Common Request is===========>", [obj])
    next();
});

app.use(expressValidator())

app.use('/api/v1/admin', route);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/orbis', orbisRoute);

app.listen(3005, () => {
    console.log(`App listening on port 3005`);
})

const httpsOptions = {
    // 'cert': fs.readFileSync('/var/www/certificate/eecf68c11409e57c.crt'),
    // 'key': fs.readFileSync('/var/www/certificate/generated-csr.txt')
}


https.createServer(httpsOptions, app).listen(3000, () => {
    console.log(`Server running on port 3000`);
}) 