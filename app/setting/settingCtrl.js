jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, passbookService, TRANSACTION_TABLE, CUSTOMERS_TABLE, DELTRANSACTION_TABLE, DELCUSTOMERS_TABLE,VILLAGE_TABLE, CUSTOMERS_COLUMNS, TRANSACTION_COLUMNS, VILLAGE_COLUMNS){
  
  $rootScope.template = {title: 'Setting'};
  $scope.msg = 'Check your backup in downloads folder once its done. Example File Name : jhora-customers-02-10-18.csv';
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
       $scope.deleteByTable(ev, DELCUSTOMERS_TABLE),  
       $scope.deleteByTable(ev, DELTRANSACTION_TABLE),  
       $scope.deleteByTable(ev, VILLAGE_TABLE)
     ]);
  }
  let exportAlltables = (ev)=>{
    return Promise.all([
      $scope.getBackupByTable(ev, CUSTOMERS_TABLE),
      $scope.getBackupByTable(ev, TRANSACTION_TABLE),  
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
  
  $scope.doCalculationsForAll = ()=>{
    // get last calc date 
    // check last calc date falls in todays time slab , if no proceed, if yes return
    //  get all cust data , get All  calc data (all calc data will be used to decide weather we need to calc or not, coz a cust many have a new tran which triggers calc)
    //  foreach cust, check last calc date falls in todays time slab , if no proceed to calc, if yes return to next cust
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let  calcSlabFrom = new Date(today.getFullYear(),  today.getMonth(), today.getDate() <= 15 ?  1 : 16);
    let  calcSlabTo = new Date(today.getFullYear(), today.getDate() <= 15 ? today.getMonth(): today.getMonth() + 1, today.getDate() <= 15 ?  15 : 0);
    //TODO get last calc date (may be based on total cust and no of calc data in the current slab)
    let lastCalcDate = new Date(new Date().getFullYear()-1, 0, 1); 
    if(lastCalcDate >= calcSlabFrom && lastCalcDate <= calcSlabTo) return {};
    
    // TODO (not optimal) query for those cust which last calc date is not in the cuurent slab (can be done by quering calc table for current slab and removing them from custs)
    let calcs = {[id]:{}}; // query for those cust which last calc date is in the cuurent slab and on foreach create calcs 
    let custs = []; // on all custs, 
    let finalCalcs = [] 
    for(let cust of custs){
      if(!calcs[cust.id]){
        //TODO get tran of cust
        let trans = [];
        passbookService.calculateFinalPSI(trans, today)
        .then((data)=>{
          data ?  finalCalcs.push(data) :''; 
        })
      }
    }
    return finalCalcs;
  };
  
});
