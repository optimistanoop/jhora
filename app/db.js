let Query = require('./query.js');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');
let q = new Query(db);

q.createCustomerTable();

// db.serialize(function() {
//   q.insert();
//   q.selectAll();    
// });

function getDBInstance(){
  if(db){
    return db;
  }else {
    db =  new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');
    return db;
  }
}

module.exports = getDBInstance;
