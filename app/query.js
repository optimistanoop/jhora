let Sqlite3 = require('sqlite3').verbose();

class Query {
  constructor(db){
     this.db = db;
  }
  
  closeDB(){
    this.db.close();
  }
  
  createCustomerTable(){
    this.db.run(`CREATE TABLE IF NOT EXISTS customers(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name           TEXT    NOT NULL,
       pageNo         TEXT     NOT NULL,
       address        CHAR(50) NOT NULL,
       mobile         INT NOT NULL,
       father         TEXT NOT NULL,
       rate           INT    NOT NULL,
       guarantor      TEXT,
       date           TEXT,
       remarks        CHAR(80) )`
     );
  }
  createTransactionTable(){
    this.db.run(`CREATE TABLE IF NOT EXISTS transactions(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       amount         INT    NOT NULL,
       date           TEXT   NOT NULL, 
       promiseDate    TEXT   NOT NULL,
       type           TEXT   NOT NULL,
       customerId     INTEGER NOT NULL,
       customer       TEXT    NOT NULL,
       address        TEXT    NOT NULL,
       remarks        CHAR(80) )`
     );
  }
  
  getTotalCountForTable(tableName, cb){
    let sql = `select count(id) from ${tableName}`;
    this.db.get(sql, (err, data)=>{
      cb ? cb(err, data) :'';
    })
  }
  
  insert(tableName ='', keys = [], values =[], cb = {} ){
    //INSERT INTO CUSTOMER (NAME, PAGENO, ADDRESS, MOBILE, FATHERSNAME, GUARANTOR, DATE, REMARKS) VALUES ('anop', 2, 'bang', 8, 'prahlad', 'arun', 'sdsd', 'dfff');
    //this.db.run(`INSERT INTO CUSTOMER (NAME, PAGENO, ADDRESS, MOBILE, FATHER, GUARANTOR, DATE, REMARKS) VALUES ('anop', 2, 'bang', 9738275930, 'prahlad', 'arun', '02-10-1991', 'demo')`);
    
    let columns = keys.map((key) => `${key}`).join(',');
    values = values.map((value) => `'${value}'`).join(',');
    let sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
    this.db.run(sql, [], (err)=>{
      cb(err);
    });
  }
  
  deleteRowById(tableName, id){
    let p = new Promise( (resolve, reject)=>{
      let sql = `DELETE FROM ${tableName} WHERE ID = ${id}`
      this.db.run(sql, [], (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  
  selectAll(tableName, cb){
      this.db.all(`select * from ${tableName}`, (err, data)=>{
        cb ? cb(data) :'';
    });
  }
};

module.exports = Query;
