const _ = require('lodash');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const LocalStorage = require('node-localstorage').LocalStorage;
filesStorge = new LocalStorage('./files_storage');

app.get('/', function (req, res) {
    res.sendFile('gui/main.html', { root: __dirname });
});

app.get('/vendor/*', function (req, res) {
    res.sendFile(req.url, { root: __dirname });
});

app.get(['/gui/*.js', '/gui/*.css', '/gui/*.html'], function (req, res) {
    res.sendFile(req.url, { root: __dirname });
});

app.use(bodyParser.json());

var filesCache = prepareFilesCache();

app.get('/file', function (req, res) {
    res.send(filesCache);
});

app.get('/file/:fileId', function (req, res) {
    var file = filesStorge.getItem(req.params.fileId);
    if (file === null) {
        res.status(404);
        res.send("Not Found");
        return;
    }
    var data = JSON.parse(file);
    res.send(data.content);
});

app.post('/file', function (req, res) {
    var data = req.body;
    if (!data || !data.content || !data.name || !data.user) {
        res.status(400);
        res.send("Bad Request");
        return;
    }
    data.id = crypto.randomBytes(20).toString('hex');
    data.timestamp = new Date().getTime();
    var meta = getFileMeta(data);
    filesCache.push(meta);
    res.send(meta);
    filesStorge.setItem(data.id, JSON.stringify(data));
});

function getFileMeta(data) {
    return {
        id: data.id,
        timestamp: data.timestamp,
        user: data.user,
        name: data.name
    };
}

function prepareFilesCache() {
    var i, content, filesCache = [];

    for (i = 0; i < filesStorge.length; ++i) {
        content = filesStorge.getItem(filesStorge.key(i));
        filesCache.push(getFileMeta(JSON.parse(content)));
    }
    return filesCache;
}

const server = app.listen(process.env.PORT || 3000, process.env.HOST || "0.0.0.0", function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});
