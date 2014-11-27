const _ = require('lodash');
const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.sendFile('gui/main.html', { root: __dirname });
});

app.get('/vendor/*', function (req, res) {
    res.sendFile(req.url, { root: __dirname });
});

app.get(['/gui/*.js', '/gui/*.css', '/gui/*.html'], function (req, res) {
    res.sendFile(req.url, { root: __dirname });
});

const server = app.listen(process.env.PORT || 3000, process.env.HOST || "0.0.0.0", function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});
