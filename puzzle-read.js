const mariadb = require('mariadb');

const { deserialize } = require('./puzzle-serializer.js');
const dbConfig = require('./db-config.js');

module.exports = async function read(req, res) {
    let result;

    let conn;

    try {
        conn = await mariadb.createConnection({
            host: dbConfig.dbHost,
            database: dbConfig.dbName,
            user: dbConfig.dbUser,
            password: dbConfig.dbPassword
        });

        if (req.params.id) {
            const id = +req.params.id;
            const rows = await conn.query(`SELECT * FROM puzzles WHERE ID = ${id}`);
            let p = rows[0];
            let puzzle = deserialize(p.SerializedRepresentation);
            puzzle.title = p.Title;
            puzzle.id = p.ID;

            result = puzzle;
        }
        else {
            let puzzles = [];

            const rows = await conn.query('SELECT * FROM puzzles');
            rows.forEach(p => {
                let puzzle = deserialize(p.SerializedRepresentation);
                puzzle.title = p.Title;
                puzzle.id = p.ID;

                puzzles.push(puzzle);
            });
            result = puzzles;
        }
    }
    catch (err) {
        throw err;
    }
    finally {
        if (conn) conn.end();
        res.send(result);
    }
}
