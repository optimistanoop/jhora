let Query = require('./query.js');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');
let q = new Query(db);
let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('close-db', (event, message) => {
  console.log('anp going to close the db', message);
  db.close();
  ipcRenderer.send('closed-db', 'thanks');
});




q.createCustomerTable();
q.createTransectionTable();
