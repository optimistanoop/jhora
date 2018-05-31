let Sqlite3 = require('sqlite3').verbose();

class Query {
  constructor(db){
     this.db = db;
  }

  closeDB(){
    this.db.close();
  }

  createCustomerTable(tableName){
    this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name           TEXT    NOT NULL,
       pageNo         TEXT     NOT NULL,
       village        CHAR(50) NOT NULL,
       mobile         INT NOT NULL UNIQUE,
       father         TEXT NOT NULL,
       rate           INT    NOT NULL,
       guarantor      TEXT,
       date           TEXT,
       remarks        CHAR(80) )`
     );
  }
  createTransactionTable(tableName){
    this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       amount         INT    NOT NULL,
       date           TEXT   NOT NULL,
       promiseDate    TEXT           ,
       type           TEXT   NOT NULL,
       rate           INT    NOT NULL,
       customerId     INTEGER NOT NULL,
       name           TEXT    NOT NULL,
       village        TEXT    NOT NULL,
       remarks        CHAR(80) )`
     );
  }
  createVillageTable(tableName){
    this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL UNIQUE)`
    );
  }

  getTotalCountForTable(tableName){
    let p = new Promise((resolve, reject)=>{
      let sql = `select count(id) from ${tableName}`;
      this.db.get(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      })
    });
    return p;
  }

  insert(tableName ='', keys = [], values =[]){
    //INSERT INTO CUSTOMER (NAME, PAGENO, village, MOBILE, FATHERSNAME, GUARANTOR, DATE, REMARKS) VALUES ('anop', 2, 'bang', 8, 'prahlad', 'arun', 'sdsd', 'dfff');
    //this.db.run(`INSERT INTO CUSTOMER (NAME, PAGENO, village, MOBILE, FATHER, GUARANTOR, DATE, REMARKS) VALUES ('anop', 2, 'bang', 9738275930, 'prahlad', 'arun', '02-10-1991', 'demo')`);
    let p = new Promise((resolve, reject)=>{
      let columns = keys.map((key) => `${key}`).join(',');
      values = values.map((value) => `'${value}'`).join(',');
      let sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
      this.db.run(sql, [], (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  update(tableName ='', keys = [], values =[], conditionOn, id){
    let p = new Promise((resolve, reject)=>{
      let columns = keys.map((key,index) => `${key}='${values[index]}'`).join(`,`);
      let sql = `UPDATE ${tableName} SET ${columns} WHERE ${conditionOn} =${id}`;
      console.log(sql);
      this.db.run(sql, [], (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
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

  selectAll(tableName){
    let p = new Promise( (resolve, reject)=>{
      this.db.all(`select * from ${tableName}`, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }

  selectAllById(tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE ${key} = ${value}`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  selectAllTransactionByDate(tableName, key, value1,value2){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE ${key} = BETWEEN toDate(${value1}) AND toDate(${value2})`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
};

module.exports = Query;
