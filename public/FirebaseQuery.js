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
    this.db = firebase.database();
    this.auth = firebase.auth();
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
      let snaps = await this.fireStore.collection(tableName).where(conditionOn, '==', id).get()
      if(!snaps.size){return true}
      let batch = this.fireStore.batch();
      snaps.forEach((doc) => {
          batch.update(this.fireStore.collection(tableName).doc(doc.id), data)
      })
      return batch.commit()
  }

  async selectAll(tableName){
    let snapshots = await this.fireStore.collection(tableName).get()
    let rows = []
    snapshots.forEach((doc) => {
      let data = doc.data();
      rows.push(data)
    })

    return rows;
  }

  async getTotalCountForTable(tableName){
    let snaps = await this.fireStore.collection(tableName).get()
    return snaps.size
  }

  async insert(tableName ='', keys = [], values =[]){
    let data = this.getReqObj(keys, values)
    data.uId = this.uuidv4()
    let timestamp = new Date(data.date).getTime()
    data.timestamp = timestamp ? timestamp : new Date().getTime()
    return this.fireStore.collection(tableName).doc(data.uId).set(data)
  }

  async deleteRowById(tableName, id){
    return this.fireStore.collection(tableName).doc(id).delete()
  }

  async deleteTableByName(tableName){
      let batch = this.fireStore.batch()
      let snapshots = await this.fireStore.collection(tableName).get()
      snapshots.forEach((doc) => {
          batch.delete(this.fireStore.collection(tableName).doc(doc.id));
      })
      return batch.commit()
  }

  async getNewCustomers(){
      // 'select c.uId from customers c left join balances b on c.uId= b.customerId where b.customerId is null'
    let balances = await this.selectAll('balances')
    let customers = await this.selectAll('customers')
    let customerIdBalanceMap = {}
    let rows = []
    for(let bal of balances){
        customerIdBalanceMap[bal.customerId] = bal
    }

    for(let cust of customers){
        if(!customerIdBalanceMap[cust.uId]){
            rows.push(cust)
        }
    }

    return rows
  }

  async selectAllById(tableName, key, value){
    let snaps = await this.fireStore.collection(tableName).where(key, '==', value).orderBy("timestamp", "asc").get()
    let rows = []
    snaps.forEach((doc) => {
      let data = doc.data();
      rows.push(data)
    })
    return rows;
  }

  async selectAllByIdActive(tableName, key, value,conditionOn,value2){
      let snaps = await this.fireStore.collection(tableName).where(key, '==', value).where(conditionOn, '==', value2).orderBy('timestamp', 'asc').get()
      let rows = []
      snaps.forEach((doc) => {
        let data = doc.data();
        rows.push(data)
      })
      return rows;
  }
  //get data by year and month of selected data
  async selectAllByYearMonth(tableName, key, value){
    return true;
  }

  //get data between two dates
  async selectDataByDates(tableName, key, value1, value2,conditionOn,value3){
    let dayStartTime = this.getClientTime(value1).dateStartTime
    let dayEndTime = this.getClientTime(value2).dateEndTime
    let snaps = await this.fireStore.collection(tableName).where(conditionOn, '==', value3).where('active', '==', '1').where('timestamp', '>=', dayStartTime).where('timestamp', '<=', dayEndTime).orderBy("timestamp", "asc").get()
    let rows = []
    snaps.forEach((doc) => {
      let data = doc.data();
      rows.push(data)
    })
    return rows;
  }

  //get greater data and equal of selected date
  async selectGreaterDataByDate(tableName,key,value){
    return true;
  }

  //get less data of selected date
  async selectLessDataByDate(tableName,key,value){
    return true;
  }

  async updateStatus(tableName, key, value,conditionOn,id){
      let snaps = await this.fireStore.collection(tableName).where(conditionOn, '==', id).get()
      let batch = this.fireStore.batch();
      let update = {[key]:value}
      snaps.forEach((doc) => {
          batch.update(this.fireStore.collection(tableName).doc(doc.id), update)
      })
      return batch.commit()
  }
  async updateActiveStatus(tableName, key, value,conditionOn,id){
      let snaps = await this.fireStore.collection(tableName).where(conditionOn, '==', id).where('active', '==', '1').get()
      let batch = this.fireStore.batch();
      let update = {[key]:value}
      snaps.forEach((doc) => {
          batch.update(this.fireStore.collection(tableName).doc(doc.id), update)
      })
      return batch.commit()
  }


  async bulkUpload(tableName, rows =[]){
      let batch = this.fireStore.batch()
      let uIds = []
      for(let row of rows){
        let uId = row.uId ? row.uId : this.uuidv4()
        uIds.push(uId)
        row.timestamp = new Date().getTime()
        let docRef = this.fireStore.collection(tableName).doc(uId)
        batch.set(docRef, row);
      }
      await batch.commit()
      return uIds
  }

  async getJoinedTable(table1,table2,match1,match2){
      let snaps1 = await this.fireStore.collection(table1).get()
      let snaps2 = await this.fireStore.collection(table2).get()
      let custMap = {}
      snaps1.forEach((doc) => {
        let data = doc.data();
        custMap[data.uId] = data
      })
      snaps2.forEach((doc) => {
        let data = doc.data();
        custMap[data.customerId] = {...data, ...custMap[data.customerId]}
      })
      return Object.values(custMap)
  }


  async selectDataByDatesWithoutCondition(tableName, key, value1, value2){
      let dayStartTime = this.getClientTime(value1).dateStartTime
      let dayEndTime = this.getClientTime(value2).dateEndTime
      let snaps = await this.fireStore.collection(tableName).where('active', '==', '1').where('timestamp', '>=', dayStartTime).where('timestamp', '<=', dayEndTime).orderBy("timestamp", "asc").get()
      return snaps.size
  }

}
