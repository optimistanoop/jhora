let Query = require('./query.js');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');
let q = new Query(db);
let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('close-db', (event, message) => {
  db.close();
});

q.createCustomerTable();
q.createTransectionTable();

function getDBInstance(){
  if(db){
    return db;
  }else {
    db =  new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');
    return db;
  }
}

module.exports = getDBInstance;
