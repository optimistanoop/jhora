jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, passbookService, TRANSACTION_TABLE, CUSTOMERS_TABLE, BALANCE_TABLE, BALANCE_HISTORY_TABLE, DELTRANSACTION_TABLE, DELCUSTOMERS_TABLE,VILLAGE_TABLE, CUSTOMERS_COLUMNS, TRANSACTION_COLUMNS,BALANCE_COLUMNS, VILLAGE_COLUMNS){
  
  $rootScope.template = {title: 'Setting'};
  $scope.msg = `Check your backup/exported file in downloads/app folder once its done.`;
  $scope.msg2 = `Import steps- export -> delete -> import`;
  $scope.msg3 = `Delete steps- export -> delete`;
  $scope.msg4 = `Example File Name : jhora-customers-dd-mm-yy-hh-mm.csv `;
  $scope.msg5 = `All calculations to be happen for todays date`;

  const json2csv = require('json2csv').parse;
  const fs = require('fs');
  const path = require('path');
  const {app} = require('electron').remote;
  const {dialog} = require('electron').remote;
  const csv2json=require("csvtojson");
  
  let deleteAllTables = (ev)=>{
    return Promise.all([
       $scope.deleteByTable(ev, CUSTOMERS_TABLE),
       $scope.deleteByTable(ev, TRANSACTION_TABLE),  
       $scope.deleteByTable(ev, BALANCE_TABLE),  
       $scope.deleteByTable(ev, BALANCE_HISTORY_TABLE),  
       $scope.deleteByTable(ev, DELCUSTOMERS_TABLE),  
       $scope.deleteByTable(ev, DELTRANSACTION_TABLE),  
       $scope.deleteByTable(ev, VILLAGE_TABLE)
     ]);
  }
  let exportAlltables = (ev)=>{
    return Promise.all([
      $scope.getBackupByTable(ev, CUSTOMERS_TABLE),
      $scope.getBackupByTable(ev, TRANSACTION_TABLE),  
      $scope.getBackupByTable(ev, BALANCE_TABLE),  
      $scope.getBackupByTable(ev, BALANCE_HISTORY_TABLE),  
      $scope.getBackupByTable(ev, DELCUSTOMERS_TABLE),  
      $scope.getBackupByTable(ev, DELTRANSACTION_TABLE),  
      $scope.getBackupByTable(ev, VILLAGE_TABLE)
    ]);
  }

  $scope.export = (ev)=>{
    exportAlltables(ev)
    .then((data)=>{
      $scope.showAlertDialog(ev, 'Backup', `Backup for all data is done.`)
    }); 
  };
  
  $scope.delete = (ev)=>{
    $scope.showConfirmDialog(ev, 'Delete all data', `Are you sure to delete all data ?`)
    .then((data)=>{
        return exportAlltables(ev);
    })
    .then((data)=>{
      return deleteAllTables(ev);
    })
    .then((data)=>{
      $scope.showAlertDialog(ev, 'Delete', `All Table data deleted.`)
    })
    .catch((err)=>{
      console.error('anp an error occured while operation', err);
    });
  };
  
  $scope.import = (ev)=>{
    let promises = [];
    let options = {title:'select files to upload', filters:[{name:'csv', extensions:['csv']}], properties:['openFile', 'multiSelections', 'message']}
    dialog.showOpenDialog(options, (filePaths)=>{
      filePaths = filePaths ? filePaths :[];
      if(filePaths.length > 0)
        exportAlltables(ev)
        .then(deleteAllTables.bind(this, ev))
        .then((data)=>{
          for(let f of filePaths){
            let splitedNames = f.split('-');
            let tableName = splitedNames[1] || '';
            if(f)
            promises.push(csv2json()
              .fromFile(f)
              .then((jsonArr)=>{
                return q.bulkUpload(tableName, jsonArr);
              })
            );
          }
          return Promise.all(promises)
          .then((data)=>{
            $scope.showAlertDialog(ev, 'Import', `All data imported succesfully.`);
          })
        })
        .catch((err)=>{
          $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
        })
    });
  };
  
  $scope.getBackupByTable = (ev, tableName)=>{
    let p =new Promise( (resolve, reject)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        let fields;
        if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE){
          fields = TRANSACTION_COLUMNS;
        }else if (tableName == CUSTOMERS_TABLE || tableName == DELCUSTOMERS_TABLE){
          fields = CUSTOMERS_COLUMNS;
        }else if (tableName == VILLAGE_TABLE){
          fields = VILLAGE_COLUMNS;
        }else if (tableName == BALANCE_TABLE){
          fields = BALANCE_COLUMNS;
        }else if (tableName == BALANCE_HISTORY_TABLE){
          fields = BALANCE_COLUMNS;
        }
        const opts = { fields };      
        const csv = json2csv(rows, opts);
        let dir = app.getPath('downloads');
        let today = new Date();
        let fileName = `jhora-${tableName}-${$mdDateLocale.formatDate(today)}-${today.getHours()}-${today.getMinutes()}.csv`;
        let backupPath = path.join(__dirname, fileName);
        fs.writeFile(backupPath, csv,  function (err) {
          if (err) reject(err);
          resolve();
        });
      })
      .catch((err)=>{
        $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
      });
    });
    
    return p;
  };
  
  $scope.deleteByTable = (ev, tableName)=>{
    let p =new Promise( (resolve, reject)=>{
      q.deleteTableByName(tableName)
      .then((rows)=>{
        resolve(rows);
      })
      .catch((err)=>{
        $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
      });
    });
    return p;
  };
  
  $scope.calc = (ev)=>{
    q.selectAll(BALANCE_TABLE)
    .then((rows)=>{
      if(!rows.length){
        return q.selectAll(CUSTOMERS_TABLE)  
      }
      return []
    })
    .then((rows)=>{
      let promises = [];
      if(rows.length){
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
          promises.push(passbookService.getUserData(row.id));
        }
      }
      return Promise.all(promises)
    })
    .then((rows)=>{
      let promises = [];
      if(rows.length){
        console.log(rows.length);
        //for(let row of rows){
        for(let i=0; i< rows.length; i++){
          let row = rows[i];
          //console.log(rows);
          if(row.results.length) {
            let balData = row.results[row.results.length-1][0];
            let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
            promises.push(q.insert(BALANCE_TABLE, BALANCE_COLUMNS, values));
          }
        }
      }
      return Promise.all(promises)
    })
    .then((data)=>{
      $rootScope.showAlertDialog(ev,'Balance','Balances Updated');
      $rootScope.$emit('updateCustomers');
    })
  };
  
});
