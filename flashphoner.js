const http = require('http');
const fs = require('fs');

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
                console.log('--------------------------------------------------------------------');
                console.log(req.method,req.url);
                console.log(body);
                res.writeHead(200);
                res.end(body);
                });

        /*
        if (req.url === '/apps/RSApp/connect') {
            let body = '';
            req.on('data', (data) => { body += data; });
            return req.on('end', () => {
                    console.log('--------------------------------------------------------------------');
                    console.log(req.method,req.url);
                    console.log(body);
                    res.writeHead(200);
                    res.end(body);
                    });
        } else if (req.url === '/apps/RSApp/playStream') {
        } else if (req.url === '/apps/RSApp/pauseStream') {
        } else if (req.url === '/apps/RSApp/stopStream') {
        } else if (req.url === '/apps/RSApp/publishStream') {
        } else if (req.url === '/apps/RSApp/snapshot') {
        } else if (req.url === '/apps/RSApp/unPublishStream') {

        } else if (req.url === '/apps/RSApp/ConnectionStatusEvent') {
        } else if (req.url === '/apps/RSApp/StreamStatusEvent') {
        } else if (req.url === '/apps/RSApp/StreamKeepAliveEvent') {
        } else if (req.url === '/apps/RSApp/OnDataEvent') {

        } else if (req.url === '/apps/RSApp/call') {
        } else if (req.url === '/apps/RSApp/sendDtmf') {
        } else if (req.url === '/apps/RSApp/answer') {
        } else if (req.url === '/apps/RSApp/hold') {
        } else if (req.url === '/apps/RSApp/unhold') {
        } else if (req.url === '/apps/RSApp/transfer') {
        } else if (req.url === '/apps/RSApp/hangup') {
        } else if (req.url === '/apps/RSApp/submitBugReport') {
        } else if (req.url === '/apps/RSApp/pushLogs') {
        } else if (req.url === '/apps/RSApp/sessionDebug') {
        } else if (req.url === '/apps/RSApp/SessionDebugStatusEvent') {
        } else if (req.url === '/apps/RSApp/CallStatusEvent') {
        } else if (req.url === '/apps/RSApp/RegistrationStatusEvent') {
        }
        */
    }
    res.writeHead(404, 'NOT FOUND');
    return res.end('NOT FOUND');

}).listen(8443, () => {
    console.log('Listening 8443 port');
});

