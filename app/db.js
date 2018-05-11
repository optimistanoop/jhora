let Query = require('./query.js');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');
let q = new Query(db);
console.log('anp db', db);

q.createCustomerTable();
console.log('anp table created');

db.serialize(function() {

q.insert();
  
  //db.run(`INSERT INTO customer (name, pageNo, address, mobile, father, guarantor, date, remarks) VALUES ('anop', 2, 'bang', 8, 'prahlad', 'arun', 'sdsd', 'dfff')`);
  
  console.log('anp table qury');

  db.all("select * from customer", function(err, row) {
    
    console.log('anp row', row)
    //let rows = document.getElementById("database");
    // let item = document.createElement("li");
    // item.textContent = "" + row.id + ": " + row.info;
    // rows.appendChild(item);
  });
  
});

db.close();
