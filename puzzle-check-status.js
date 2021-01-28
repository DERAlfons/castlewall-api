const mariadb = require('mariadb');

const dbConfig = require('./db-config.js');

module.exports = async function check(req, res) {
    let result;

    let conn;

    try {
        conn = await mariadb.createConnection({
            host: dbConfig.dbHost,
            database: dbConfig.dbName,
            user: dbConfig.dbUser,
            password: dbConfig.dbPassword
        });

        const id = +req.params.id;
        const rows = await conn.query(`SELECT * FROM puzzleChecks WHERE ID = ${id}`);
        result = rows[0].Status;
    }
    catch (err) {
        throw err;
    }
    finally {
        if (conn) conn.end();
        res.send({ status: result });
    }
}
