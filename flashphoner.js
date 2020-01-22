const http = require('http');
const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('log.txt', { flags: 'w' });
const logStdout = process.stdout;
 
console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

http.createServer((req, res) => {

    if (req.method === 'GET') {
        if (req.url === '/') {
            return fs.readFile('./index.html', (err, data) => {
                if (err) { throw err; }
                res.end(data);
            });
        }
        return fs.readFile(`.${req.url}`, (err, data) => {
            if (err) {
                res.writeHead(404, 'NOT FOUND');
                return res.end('NOT FOUND');
            }
            return res.end(data);
        });
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (data) => { body += data; });
        return req.on('end', () => {
                console.log('----------------------------------------------------------------------');
                console.log(req.method,req.url);
                console.log(JSON.stringify(JSON.parse(body), null, 4));
                res.writeHead(200);
                res.end(body);
                });
    }
    console.log('----------------------------------------------------------------------');
    console.log(req.method,req.url);
    res.writeHead(404, 'NOT FOUND');
    return res.end('NOT FOUND');

}).listen(8889, () => {
    console.log('Listening 8889 port');
});

