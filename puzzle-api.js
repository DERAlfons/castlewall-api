const express = require('express')
const cors = require('cors')

const sqltest = require('./sqltest')
const read = require('./puzzle-read.js')
const check = require('./check.js')

const { deserialize } = require('./puzzle-serializer.js')

const server = express()

var corsOptions = {
	origin: '*',
	optionSuccessStatus: 200
}

server.use(cors(corsOptions))
server.use(express.json())

server.post('/sqltest', sqltest)
server.get('/read', read)
server.get('/read/:id', read)
server.get('/check/:id', check)

server.listen(8000, 'localhost', () => {
	console.log('Server started!')
})
