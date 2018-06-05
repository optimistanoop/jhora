let Sqlite3 = require('sqlite3').verbose();

class Query {
  constructor(db){
     this.db = db;
  }

  closeDB(){
    let p = new Promise((resolve, reject)=>{
      this.db.close((err, data)=>{
       if(err) reject(err);
       resolve(data);
      }); 
   });
   return p;
  }

  createCustomerTable(tableName){
    let p = new Promise((resolve, reject)=>{
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
         remarks        CHAR(80),
         salutation     TEXT    NOT NULL )`
         , [], (err, data)=>{
         if(err) reject(err);
         resolve(data);
       }); 
     });
     return p;
  }
  
  createTransactionTable(tableName){
    let p = new Promise((resolve, reject)=>{
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
         , [], (err, data)=>{
         if(err) reject(err);
         resolve(data);
       });
     });
     return p; 
  }
  
  createVillageTable(tableName){
    let p = new Promise((resolve, reject)=>{

    this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL UNIQUE)`
       , [], (err, data)=>{
       if(err) reject(err);
       resolve(data);
     }); 
   });
   return p;
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
  //get data by year and month of selected data
   selectAllByYearMonth(tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE strftime('%Y', ${key}) = strftime('%Y', ${key}) AND strftime('%m', ${key}) = strftime('%m', ${key})`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }

  //get data between two dates
   selectDataByDates(tableName, key, value1, value2){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE date(${key}) BETWEEN '${value1}' AND '${value2}'`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }

//get greater data and equal of selected date
  selectGreaterDataByDate(tableName,key,value){
    let p = new Promise( (resolve, reject)=>{
    let sql = `SELECT * from ${tableName} where date(${key}) >= date(${value})`

    this.db.all(sql, (err, data)=>{
      if(err) reject(err);
      resolve(data);
    });
  });
    return p;
  }

  //get less data of selected date
  selectLessDataByDate(tableName,key,value){
    let p = new Promise( (resolve, reject)=>{
    let sql = `SELECT * from ${tableName} where date(${key}) < date(${value})`
    this.db.all(sql, (err, data)=>{
      if(err) reject(err);
      resolve(data);
    });
  });
    return p;
  }


};

module.exports = Query;
