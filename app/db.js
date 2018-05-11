
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/Users/anoop/Documents/electron-boilerplate-sqlite/db.db');

db.serialize(function() {
  db.run("CREATE TABLE customer (info TEXT)");

  var stmt = db.prepare("INSERT INTO customer VALUES (?)");
  for (let i = 0; i < 10; i++) {
    stmt.run("customer " + i);
  }

  stmt.finalize();

  let rows = document.getElementById("database");
  db.each("SELECT rowid AS id, info FROM customer", function(err, row) {
    let item = document.createElement("li");
    item.textContent = "" + row.id + ": " + row.info;
    rows.appendChild(item);
  });
});

db.close();