jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, passbookService, TRANSACTION_TABLE, CUSTOMERS_TABLE, BALANCE_TABLE, BALANCE_HISTORY_TABLE, DELTRANSACTION_TABLE, DELCUSTOMERS_TABLE,VILLAGE_TABLE, CUSTOMERS_COLUMNS, TRANSACTION_EXPORT_COLUMNS,BALANCE_COLUMNS, BALANCE_HISTORY_COLUMNS, VILLAGE_COLUMNS){
  
  $rootScope.template = {title: 'Setting'};
  $scope.msg = `Check your exported file in <selected-folder>/jhorabackup/dd-mm-yy-hh-mm-ss folder once its done.`;
  $scope.msg2 = `Import steps- export (deault folder for export is /Downloads) -> delete -> import.`;
  $scope.msg3 = `Delete steps- export (select folder for export) -> delete.`;
  $scope.msg4 = `Example File Name : jhora-customers-dd-mm-yy-hh-mm.csv.`;
  $scope.msg5 = `All balance calculations for cutomers to be happen for todays date.`;
  $scope.showProgress = false;
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
  let exportAlltables = (ev, dir)=>{
    return Promise.all([
      $scope.getBackupByTable(ev, CUSTOMERS_TABLE, dir),
      $scope.getBackupByTable(ev, TRANSACTION_TABLE, dir),  
      $scope.getBackupByTable(ev, BALANCE_TABLE, dir),  
      $scope.getBackupByTable(ev, BALANCE_HISTORY_TABLE, dir),  
      $scope.getBackupByTable(ev, DELCUSTOMERS_TABLE, dir),  
      $scope.getBackupByTable(ev, DELTRANSACTION_TABLE, dir),  
      $scope.getBackupByTable(ev, VILLAGE_TABLE, dir)
    ]);
  }
  
  let createBackupFolder = (tableName, dir)=>{
    dir = dir ? dir : app.getPath('downloads');
    let today = new Date();
    let fileName = `jhora-${tableName}-${$mdDateLocale.formatDate(today)}-${today.getHours()}-${today.getMinutes()}.csv`;
    dir = path.join(dir, `jhorabackup`);
    if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
    dir = path.join(dir, `${$mdDateLocale.formatDate(today)}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`);
    if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
    console.log('anp dir', dir);
    return path.join(dir, fileName);
  }

  $scope.export = (ev)=>{
    $scope.showProgress = true;
    let options = {title:'Select folder for export', properties:['openDirectory']}
    // dialog.showSaveDialog({defaultPath:'hello.csv'},(filePaths)=>{
    dialog.showOpenDialog(options, (filePaths)=>{
      console.log(filePaths);
      if(filePaths && filePaths[0])
      exportAlltables(ev, filePaths[0])
      .then((data)=>{
        $scope.showProgress = false;
        $rootScope.showToast(`Backup for all data is done.`)
      }); 
    });
  };
  
  $scope.delete = (ev)=>{
    $scope.showProgress = true;
    $scope.showConfirmDialog(ev, 'Delete all data', `Are you sure to delete all data ?`)
    .then((data)=>{
      let options = {title:'Select folder for export', properties:['openDirectory']}
      dialog.showOpenDialog(options, (filePaths)=>{
        console.log(filePaths);
        if(filePaths && filePaths[0])
        exportAlltables(ev, filePaths[0])
        .then((data)=>{
          return deleteAllTables(ev);
        })
        .then((data)=>{
          $scope.showProgress = false;
          $scope.showToast(`All Table data deleted.`)
        })
        .catch((err)=>{
          console.error('anp an error occured while operation', err);
        });
        
    })
    })
  };
  $scope.import = (ev)=>{
    let options = {title:'select files to upload', filters:[{name:'csv', extensions:['csv']}], properties:['openFile', 'multiSelections', 'message']}
    dialog.showOpenDialog(options, (filePaths)=>{
      filePaths = filePaths ? filePaths :[];
      let promises=[];
      let tableNames=[];
      $timeout(()=>{
        $scope.showProgress = true;
      },0)
      if(filePaths.length)
        for(let f of filePaths){
          let splitedNames = f.split('-');
          let tableName = splitedNames[1] || '';
          tableNames.push(tableName);
          promises.push($scope.getBackupByTable(ev, tableName));
        }
        Promise.all(promises)
        .then((data)=>{
          let promises=[]
          for(let tableName of tableNames){
            promises.push($scope.deleteByTable(ev, tableName));
          }
          return Promise.all(promises);
        })
        .then((data)=>{
          let promises = [];
          for(let i in filePaths){
            let f = filePaths[i];
            let tableName = tableNames[i];
            if(f)
            promises.push(csv2json()
              .fromFile(f)
              .then((jsonArr)=>{
                return q.bulkUpload(tableName, jsonArr);
              })
            );
          }
          return Promise.all(promises)
        })
        .then((data)=>{
          $timeout(()=>{
            $scope.showProgress = false;
          },0)
          data.length && $rootScope.showToast(`All data imported succesfully.`);
          !data.length && $rootScope.showToast(`Nothing to import.`);
        })
        .catch((err)=>{
          $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
        })
    });
  };
  
  $scope.getBackupByTable = (ev, tableName, dir)=>{
    let p =new Promise( (resolve, reject)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        let fields;
        if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE){
          fields = TRANSACTION_EXPORT_COLUMNS;
        }else if (tableName == CUSTOMERS_TABLE || tableName == DELCUSTOMERS_TABLE){
          fields = CUSTOMERS_COLUMNS;
        }else if (tableName == VILLAGE_TABLE){
          fields = VILLAGE_COLUMNS;
        }else if (tableName == BALANCE_TABLE){
          fields = BALANCE_COLUMNS;
        }else if (tableName == BALANCE_HISTORY_TABLE){
          fields = BALANCE_HISTORY_COLUMNS;
        }
        const opts = { fields };      
        const csv = json2csv(rows, opts);
        let backupPath = createBackupFolder(tableName, dir)
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
    $scope.showProgress = true;
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
        for(let row of rows){
            let balData = row.results[row.results.length-1][0];
            let values = balData.customerId ? [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total] : null;
            values && promises.push(q.insert(BALANCE_TABLE, BALANCE_COLUMNS, values));
        }
      }
      return Promise.all(promises)
    })
    .then((data)=>{
      $scope.showProgress = false;
      if(data.length){
        $rootScope.showToast(`Balances Updated`);
        $rootScope.$emit('updateCustomers');
      }else{
        $rootScope.showToast('Nothing to update');
      }
    })
  };
  
});
