class SQLiteWrapper {
  constructor(){
    this.host ='';
    this.port ='';
  }
  
  close(cb){
    // call close db api
    fetch('/close')
    .then((data)=>{
      return data.json()
    })
    .then((data)=>{
      cb(data)
    })
  }
  
  all(sql, cb){  
    // call get All api
    fetch('/all/'+sql)
    .then((data)=>{
      return data.json()
    })
    .then((data)=>{
      cb(data)
    })
  }
  
  get(sql, cb){  
    // call get api
    fetch('/get/'+sql)
    .then((data)=>{
      return data.json()
    })
    .then((data)=>{
      cb(data)
    })
  }
  
  run(sql, arr=[], cb){
    // call run api
    fetch('/run/'+sql)
    .then((data)=>{
      return data.json()
    })
    .then((data)=>{
      cb(data)
    })
  }


};
