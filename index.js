'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { promisify } = require('util');

const config = require('./config');
const rpcInit = require('./rpc/init');
const dbConnect = require('./db/connect');
const statuses = require('./utils/statuses');
const errors = require('./utils/errors');
const blockchain = require('./utils/blockchain');
const getPrice = require('./utils/price');
const buildRoutes = require('./routes/routes');
const attachNotFound = require('./middlewares/not_found');
const attachErrorHandler = require('./middlewares/error_handler');

const delay = promisify(setTimeout);

const app = express();

(async () => {
    try {
        app.locals.rpc = await rpcInit();
        const dbLocals = await dbConnect();

        if (dbLocals.client.isConnected)
            console.log('MongoDB connected');

        Object.assign(app.locals, dbLocals);

        while (true) {
            const [{ result: getTxOutSetInfo }, price] = await Promise.all([
                app.locals.rpc.getTxOutSetInfo(),
                getPrice()
            ]);

            Object.assign(app.locals, { getTxOutSetInfo, price });
            await delay(60000);
        }
    } catch (error) {
        console.error(error);
    }
})();

app.use(morgan('dev'));
app.disable('x-powered-by');
app.use(cors());
app.use('/search', express.json());

const locals = { config, statuses, errors, blockchain };

Object.assign(app.locals, locals);

buildRoutes(app);

attachNotFound(app);
attachErrorHandler(app);

app.listen(
    process.env.PORT,
    () => console.log(`Server listening on port ${process.env.PORT}`)
);
