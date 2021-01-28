const express = require('express');
const cors = require('cors');

const read = require('./puzzle-read.js');
const add = require('./puzzle-add.js');
const checkStatus = require('./puzzle-check-status.js');

const server = express();

var corsOptions = {
	origin: '*',
	optionSuccessStatus: 200
};

server.use(cors(corsOptions));
server.use(express.json());

server.get('/read', read);
server.get('/read/:id', read);
server.post('/add', add);
server.get('/checkstatus/:id', checkStatus);

server.listen(8000, 'localhost', () => {
	console.log('Server started!')
});
