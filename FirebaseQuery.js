class FirebaseWrapper {

  constructor(){

  }

  update(tableName ='', keys = [], values =[], conditionOn, id){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  selectAll(tableName){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  getTotalCountForTable(tableName){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  insert(tableName ='', keys = [], values =[]){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  update(tableName ='', keys = [], values =[], conditionOn, id){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  deleteRowById(tableName, id){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  deleteTableByName(tableName){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  selectAll(tableName){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  wildCard(sql){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  selectAllById(tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  selectAllByIdActive(tableName, key, value,conditionOn,value2){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  //get data by year and month of selected data
  selectAllByYearMonth(tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  //get data between two dates
  selectDataByDates(tableName, key, value1, value2,conditionOn,value3){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  //get greater data and equal of selected date
  selectGreaterDataByDate(tableName,key,value){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  //get less data of selected date
  selectLessDataByDate(tableName,key,value){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  updateStatus(tableName, key, value,conditionOn,id){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  updateActiveStatus(tableName, key, value,conditionOn,id){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  bulkUpload(tableName, rows =[]){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  selectAllTwoTable(table1,table2,columns,match1,match2,conditionOn=""){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  countTransactionByType(column, tableName, key, value){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }
  selectDataByDatesWithoutCondition(tableName, key, value1, value2){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

}
