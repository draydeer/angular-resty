
var app = require('express')();

app.all('/', function (req, res) {
    if (req.headers['content-type'] && req.headers['content-type'].indexOf('application/json') !== - 1) {
        req.body = JSON.parse(req.body);
    }

    res.status(200).json({body: body, method: req.method, params: req.params, query: req.query});
});

app.all('/:id', function (req, res) {
    if (req.headers['content-type'] && req.headers['content-type'].indexOf('application/json') !== - 1) {
        req.body = JSON.parse(req.body);
    }

    res.status(200).json({body: body, method: req.method, params: req.params, query: req.query});
});

app.get('/response/close', function (req, res) {
    res.socket.close();
});

app.get('/response/headers', function (req, res) {
    res.status(200).json(req.headers);
});

app.get('/response/:status', function (req, res) {
    res.status(res.params.status).end();
});

app.listen(3000, function () {
    console.log('Server is running on port 3000.');
});
