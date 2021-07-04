const uuid = require('uuid');
const Got = require('got');
const { getClient, initDb } = require('./database');

(async() => {
    await initDb();

    const client = getClient();
    if(!client) {
        console.log('Not connected .. nothing to do');
        process.exit(-1);
    }

    const rsp = await Got('https://en.wikipedia.org/wiki/Special:Random');
    if(rsp.request.redirects.length === 1) {
        const id = uuid.v4();
        const content = `Article for today is: ${rsp.request.redirects[0]}`;
        await client.query(`insert into todos (id, content, done) VALUES ($1, $2, false)`, [
            id, content
        ])
    }

    client.end();
})();