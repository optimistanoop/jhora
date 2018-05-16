let Query = require('./query.js');
let sqlite3 = require('sqlite3').verbose();
const {app} = require('electron').remote;
const path = require('path');
let dir = app.getPath("appData");
let dbPath = path.join(dir, 'db.db')
console.log('anp dbPath', dbPath);
// 'C:\Users\Administrator\Downloads\db.db'
let db = new sqlite3.Database(dbPath);
let q = new Query(db);
let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('close-db', (event, message) => {
 console.log('anp going to close the db', message);
 db.close();
 ipcRenderer.send('closed-db', 'thanks');
});

q.createCustomerTable();
q.createTransectionTable();