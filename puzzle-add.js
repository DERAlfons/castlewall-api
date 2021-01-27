const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const mariadb = require('mariadb');

const { serialize } = require('./puzzle-serializer.js');
const dbConfig = require('./db-config.js');

module.exports = async function sqltest(req, res) {
    let puzzle = req.body.puzzle;
    let accessCode = req.body.accessCode;

    let conn;
    let sqlres;

	try {
        conn = await mariadb.createConnection({
            host: dbConfig.dbHost,
            database: dbConfig.dbName,
            user: dbConfig.dbUser,
            password: dbConfig.dbPassword
        });

        sqlres = await conn.query('INSERT INTO puzzleChecks (Status) VALUE (?)', ['progress']);
        puzzle.id = sqlres.insertId;
        res.send(puzzle);

        const { stdout } = await execFile('./solvability-prover.py', [JSON.stringify(puzzle)]);
        const checkResult = JSON.parse(stdout);

        if (checkResult.solvable == 'unique' && accessCode == dbConfig.accessCode) {
            sqlres = await conn.query('INSERT INTO puzzles (Title, SerializedRepresentation) VALUES (?, ?)', [puzzle.title, serialize(puzzle)]);
        }

        sqlres = await conn.query(`UPDATE puzzleChecks SET Status = '${checkResult.solvable}' WHERE ID = ${puzzle.id}`);
	}
    catch (err) {
		throw err;
	}
    finally {
		if (conn) conn.end();
	}
}
