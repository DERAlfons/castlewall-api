const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

async function pythonTest() {
    let a = { };
    a.b = 1;
    a.c = 'Hallo';
    const { stdout } = await execFile('./a_py_script.py', [JSON.stringify(a)]);
    console.log(stdout);
}

pythonTest();

a = 'Hallo';
console.log(a);
console.log(JSON.stringify(a));
