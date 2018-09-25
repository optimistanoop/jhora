let q;
let dbInit = ()=>{
  //let Query = require('./query.js');
  let sqlite3 = require('sqlite3').verbose();
  const {app} = require('electron').remote;
  const path = require('path');
  const fs = require('fs');
  let dir = app.getPath("appData");
  dir = path.join(dir, 'jhora');
  if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
  let dbPath = path.join(dir, 'db.db');
  let db = new sqlite3.Database(dbPath);
  q = new Query(db);
  let ipcRenderer = require('electron').ipcRenderer;

  ipcRenderer.on('close-db', (event, message) => {
   console.log('anp going to close the db', message);
   db.close((err)=>{
     if(err) console.log('anp an error occured while closing db');
     console.log('anp db closed succesfully cb ');
   });
   ipcRenderer.send('closed-db', 'thanks');
  });

  Promise.all([
    q.createCustomerTable('customers', 'UNIQUE'),
    q.createTransactionTable('transactions','active INT DEFAULT 1'),
    q.createVillageTable('village'),
    q.createBalanceTable('balances'),
    q.createBalanceTable('balances_history',',action'),
    q.createCustomerTable('delcustomers'),
    q.createTransactionTable('deltransactions','deletedOn TEXT'),
  ])
  .then((data)=>{
    return Promise.all([ q.createTrigger('onInsert','INSERT'), q.createTrigger('onUpdate','UPDATE')])
  })
  .then((data)=>{
    angular.bootstrap(document, ['jhora']);
  })
  .catch((err)=>{
    console.error('anp an error occured while creating table', err);
  })
  
};

if(isElectron()){
  dbInit()
} else{
  //q = new FirebaseWrapper();
  q = new Query(new SQLiteWrapper());
  angular.bootstrap(document, ['jhora']);
}
