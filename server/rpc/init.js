require('dotenv').config();
const Rpc = require('../utils/rpc');

const rpcInit = async () => {
    try {
        const rpc = new Rpc(
            `http://${process.env.RPC_USER}:${process.env.RPC_PASS}@${process.env.RPC_HOST}:${process.env.RPC_PORT}`,
            [
                'getTxOutSetInfo',
                'getPeerInfo',
                'getBlockCount',
                'getBlockHash',
                'getBlock',
                'getRawTransaction',
                'getNetworkInfo',
                'getRawMempool',
                'getDifficulty'
            ]
        );

        return rpc;
    } catch (error) {
        throw error.message;
    }
};

module.exports = rpcInit;
