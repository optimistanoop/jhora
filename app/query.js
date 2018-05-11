let Sqlite3 = require('sqlite3').verbose();

class Query {
  constructor(db){
     this.db = db;
  }
  
  closeDB(){
    this.db.close();
  }
  
  createCustomerTable(){
    this.db.run(`CREATE TABLE IF NOT EXISTS customer(
       ID INTEGER PRIMARY KEY AUTOINCREMENT,
       name           TEXT    NOT NULL,
       pageNo         INT     NOT NULL,
       address        CHAR(50) NOT NULL,
       mobile         INT NOT NULL,
       father    TEXT NOT NULL,
       guarantor      TEXT NOT NULL,
       date           TEXT,
       remarks        CHAR(80) )`
     );
  }
  
  insert(tableName, data = {} ){
    //INSERT INTO CUSTOMER (NAME, PAGENO, ADDRESS, MOBILE, FATHERSNAME, GUARANTOR, DATE, REMARKS) VALUES ('anop', 2, 'bang', 8, 'prahlad', 'arun', 'sdsd', 'dfff');
    this.db.run(`INSERT INTO CUSTOMER (NAME, PAGENO, ADDRESS, MOBILE, FATHER, GUARANTOR, DATE, REMARKS) VALUES ('anop', 2, 'bang', 8, 'prahlad', 'arun', 'sdsd', 'dfff')`);

  }
  
  selectAll(tableName){
    this.db.all("select * from customer", function(err, rows) {
      console.log('anp row', rows);
    });
  }
};

module.exports = Query;
