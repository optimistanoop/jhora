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
  getReqObj(keys, values){
      let data = {}
      for(let i = 0; i < keys.length; i++){
        data[keys[i]] = values[i];
      }
      return data
  }
  async update(tableName ='', keys = [], values =[], conditionOn, id){
      let data = this.getReqObj(keys, values)
      let snaps = await this.fireStore.collection(tableName).where(conditionOn, '===', id).get()
      let docId = ''
      snaps.forEach((doc) => {
        docId = doc.id
      })
      let p = await this.fireStore.collection(tableName).doc(docId).update(data)
    return p;
  }

  async selectAll(tableName){
    let snapshots = await this.fireStore.collection(tableName).get()
    let rows = []
    snapshots.forEach((doc) => {
      let data = doc.data();
      rows.push(data)
    })
    console.log('anp data', rows);

    return rows;
  }

  async getTotalCountForTable(tableName){
    let snaps = await this.fireStore.collection(tableName).get()
    return snaps.size
  }

  async insert(tableName ='', keys = [], values =[]){
    let data = this.getReqObj(keys, values)
    let p = await this.fireStore.collection(tableName).add(data)
    return p;
  }

  async deleteRowById(tableName, id){
    let p = await this.fireStore.collection(tableName).doc(id).delete()
    return p;
  }

  deleteTableByName(tableName){
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

  async selectAllById(tableName, key, value){
    let snaps = await this.fireStore.collection(tableName).where(key, '==', value).get()
    let rows = []
    snaps.forEach((doc) => {
      let data = doc.data();
      rows.push(data)
    })
    return rows;
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
