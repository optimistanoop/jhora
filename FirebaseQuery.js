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

  uuidv4() {
    let x = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return Math.floor(new Date() / 1000)+"-"+ x;
  }

  getClientTime(date){
    let startTime = new Date(date).setHours(0, 0, 0, 0);
    let endTime = new Date(date).setHours(23, 59, 59, 59);
    let dateStartTimeUnix = parseInt( startTime / 1000 | 0);
    let dateEndTimeUnix = parseInt(Math.floor(endTime / 1000 | 0))
    return {dateStartTime: startTime, dateEndTime: endTime, dateStartTimeUnix: dateStartTimeUnix, dateEndTimeUnix: dateEndTimeUnix, time: (new Date).getTime(), date: new Date(), yymmdd: new Date(date).toISOString().split('T')[0]};
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
    data.uId = this.uuidv4()
    let p = await this.fireStore.collection(tableName).doc(data.uId).set(data)
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
    let snaps = await this.fireStore.collection(tableName).where(key, '==', value).orderBy("timestamp", "desc").get()
    let rows = []
    snaps.forEach((doc) => {
      let data = doc.data();
      rows.push(data)
    })
    return rows;
  }

  selectAllByIdActive(tableName, key, value,conditionOn,value2){
      //      let sql = `SELECT * FROM ${tableName} WHERE ${key} = '${value}' AND ${conditionOn} = '${value2}' order by date(date)`

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
  async updateActiveStatus(tableName, key, value,conditionOn,id){
      let snaps = await this.fireStore.collection(tableName).where(conditionOn, '==', id).where('active', '==', '1').get()
      let batch = this.fireStore.batch();
      let update = {[key]:value}
      snaps.forEach((doc) => {
          batch.update(doc, update)
      })
      return batch.commit()
  }


  bulkUpload(tableName, rows =[]){
    let p = new Promise( (resolve, reject)=>{
      resolve([]);
    });
    return p;
  }

  async getCustomersBalances(table1,table2,match1,match2){
      let snaps1 = await this.fireStore.collection(table1).get()
      let snaps2 = await this.fireStore.collection(table2).get()
      let custMap = {}
      snaps1.forEach((doc) => {
        let data = doc.data();
        custMap[data.uId] = data
      })
      snaps2.forEach((doc) => {
        let data = doc.data();
        custMap[data.customerId] = {...custMap[data.customerId], ...data}
      })
      return Object.values(custMap)
  }


  async selectDataByDatesWithoutCondition(tableName, key, value1, value2){
      let dayStartTime = this.getClientTime(value1).dateStartTime
      let dayEndTime = this.getClientTime(value2).dateEndTime
      let snaps = await this.fireStore.collection(tableName).where('active', '==', '1').where('timestamp', '>=', dayStartTime).where('timestamp', '<=', dayEndTime).orderBy("timestamp", "desc").get()
      return snaps.size
  }

}
