class FirebaseWrapper {

  constructor(){
    let config = {
      apiKey: "AIzaSyD9B2YdN4gAPqryKSiHRQocPc9kA_ZSFLY",
      authDomain: "jhoraapp.firebaseapp.com",
      databaseURL: "https://jhoraapp.firebaseio.com",
      projectId: "jhoraapp",
      storageBucket: "",
      messagingSenderId: "105398319929"
    };
    firebase.initializeApp(config);
    this.db = firebase.database();;
    this.fireStore = firebase.firestore();;
    this.fireStore.settings({ timestampsInSnapshots: true });
  }

  update(tableName ='', keys = [], values =[], conditionOn, id){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  selectAll(tableName){
    let p = new Promise( (resolve, reject)=>{
      this.fireStore.collection(tableName).get()
      .then((snapshots) => {
        let rows = []
        snapshots.forEach((doc) => {
          let data = doc.data();
          rows.push(data)
        })
        console.log('anp data', rows);
        resolve(rows)
      })
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
    let data = {}
    for(let i = 0; i < keys.length; i++){
      data[keys[i]] = values[i];
    }
    let p = new Promise( (resolve, reject)=>{
      resolve(this.fireStore.collection(tableName).add(data));
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
