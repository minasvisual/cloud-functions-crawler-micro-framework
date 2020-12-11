const scraper = require('./index')

var args = process.argv.slice(2);

const model = args[0];
const response  = { send: console.log, status: () => response }
scraper.crawler(
    { body: { model: model } },
    response
)

//process.exit()