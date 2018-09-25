let isElectron = () => {
  return window && window.process && window.process.type;
}

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

  createCustomerTable(tableName, unique =''){
    let p = new Promise((resolve, reject)=>{
      this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name           TEXT    NOT NULL,
         pageNo         TEXT     NOT NULL ${unique},
         village        CHAR(50) NOT NULL,
         mobile         INT NOT NULL ${unique},
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

  createTransactionTable(tableName,data){
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
         remarks        CHAR(80),
         ${data})`
         , [], (err, data)=>{
         if(err) reject(err);
         resolve(data);
       });
     });
     return p;
  }
  createBalanceTable(tableName,column = ""){
    let p = new Promise((resolve, reject)=>{
      this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         amount         INT    NOT NULL,
         date           TEXT   NOT NULL,
         calcTill       TEXT   NOT NULL,
         calcOn       TEXT   NOT NULL,
         dueFrom       TEXT   NOT NULL,
         nextDueDate       TEXT   NOT NULL,
         customerId     INTEGER NOT NULL,
         type           TEXT   NOT NULL,
         p           INT    NOT NULL,
         si           INT    NOT NULL,
         rate           INT    NOT NULL,
         total           INT    NOT NULL,
         remarks        CHAR(80)
         ${column})`
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

  createTrigger(triggerName,action){
    let p = new Promise((resolve, reject)=>{
    this.db.run(`CREATE TRIGGER IF NOT EXISTS ${triggerName} AFTER ${action} ON balances FOR EACH ROW
      BEGIN
      INSERT INTO balances_history (
        amount,date,calcTill,calcOn,dueFrom, nextDueDate, customerId,type,p,si,rate,total,remarks,action)
      VALUES (new.amount,new.date,new.calcTill,new.calcOn,new.dueFrom,new.nextDueDate,new.customerId,new.type,new.p,
        new.si,new.rate,new.total,new.remarks,'${action}');
        END;`
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

  deleteTableByName(tableName){
    let p = new Promise( (resolve, reject)=>{
      let sql = `DELETE FROM ${tableName}`
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
  wildCard(sql){
    let p = new Promise( (resolve, reject)=>{
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }

  selectAllById(tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE ${key} = '${value}' order by date(date)`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  selectAllByIdActive(tableName, key, value,conditionOn,value2){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE ${key} = '${value}' AND ${conditionOn} = '${value2}' order by date(date)`
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

  //get data between two dates with conditions
   selectDataByDates(tableName, key, value1, value2,conditionOn,value3){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT * FROM ${tableName} WHERE ${conditionOn} = ${value3} AND active = 1 AND date(${key}) BETWEEN '${value1}' AND '${value2}' ORDER BY date(date)`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }

  //get data between two dates without conditions
  selectDataByDatesWithoutCondition(tableName, key, value1, value2){
   let p = new Promise( (resolve, reject)=>{
     let sql = `SELECT count(id) FROM ${tableName} WHERE active = 1 AND date(${key}) BETWEEN '${value1}' AND '${value2}' ORDER BY date(date)`
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

  updateStatus(tableName, key, value,conditionOn,id){
    let p = new Promise( (resolve, reject)=>{
      let sql = `UPDATE ${tableName} SET ${key} = ${value} WHERE ${conditionOn} =${id}`
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  updateActiveStatus(tableName, key, value,conditionOn,id){
    let p = new Promise( (resolve, reject)=>{
      let sql = `UPDATE ${tableName} SET ${key} = ${value} WHERE ${conditionOn} =${id} AND active=1`;
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  bulkUpload(tableName, rows =[]){
    let p = new Promise( (resolve, reject)=>{
      if(rows.length == 0) resolve(`No data found for ${tableName}`);
      let keys = Object.keys(rows[0]) || [];
      let columns = keys.map((key) => `${key}`).join(',');
      let i = 0;
      for (let r of rows) {
        let values = Object.values(r);
        values = values.map((value) => `'${value}'`).join(',');
        let sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
          this.db.run(sql, [], (err, data)=>{
            if(err) reject(err);
            i++;
            if(i == rows.length) resolve(data);
          });
      }
    });
    return p;
  }
  selectAllTwoTable(table1,table2,columns,match1,match2,conditionOn=""){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT ${columns} FROM ${table1} LEFT JOIN ${table2} ON ${match1} = ${match2} ${conditionOn}`;
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }
  countTransactionByType(column, tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      let sql = `SELECT ${column} FROM ${tableName} WHERE ${key} = '${value}'`;
      this.db.all(sql, (err, data)=>{
        if(err) reject(err);
        resolve(data);
      });
    });
    return p;
  }


};

if(isElectron()){
  module && (module.exports = Query);
} 
