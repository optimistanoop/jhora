jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, TRANSACTION_TABLE, CUSTOMERS_TABLE, DELTRANSACTION_TABLE, DELCUSTOMERS_TABLE,VILLAGE_TABLE, CUSTOMERS_COLUMNS, TRANSACTION_COLUMNS, VILLAGE_COLUMNS){
  
  $rootScope.template = {title: 'Setting'};
  $scope.msg = 'Check your backup in downloads folder once its done. Example File Name : jhora-customers-02-10-18.csv';
  const json2csv = require('json2csv').parse;
  const fs = require('fs');
  const path = require('path');
  const {app} = require('electron').remote;
  const {dialog} = require('electron').remote;
  const csv2json=require("csvtojson");


  $scope.export = (ev)=>{
    $scope.getBackupByTable(ev, CUSTOMERS_TABLE);
    $scope.getBackupByTable(ev, TRANSACTION_TABLE);  
    $scope.getBackupByTable(ev, DELCUSTOMERS_TABLE);  
    $scope.getBackupByTable(ev, DELTRANSACTION_TABLE);  
    $scope.getBackupByTable(ev, VILLAGE_TABLE);  
  };
  
  $scope.delete = (ev)=>{
    $scope.showConfirmDialog(ev, 'Delete all data', `Are you sure to delete all data ?`)
    .then((data)=>{
         $scope.deleteByTable(ev, CUSTOMERS_TABLE);
         $scope.deleteByTable(ev, TRANSACTION_TABLE);  
         $scope.deleteByTable(ev, DELCUSTOMERS_TABLE);  
         $scope.deleteByTable(ev, DELTRANSACTION_TABLE);  
         $scope.deleteByTable(ev, VILLAGE_TABLE);
      })
      .catch((err)=>{
        console.error('anp an error occured while operation', err);
      });
  };
  
  $scope.import = (ev)=>{
    let options = {title:'select files to upload', filters:[{name:'csv', extensions:['csv']}], properties:['openFile', 'multiSelections', 'message']}
    dialog.showOpenDialog(options, (filePaths)=>{
      filePaths = filePaths ? filePaths :[];
      for(let f of filePaths){
        let splitedNames = f.split('-');
        let tableName = splitedNames[1] || '';
        if(f)
        csv2json()
        .fromFile(f)
        .then((jsonArr)=>{
          return q.bulkUpload(tableName, jsonArr);
        })
        .then((data)=>{
          $scope.showAlertDialog(ev, 'Import', `${tableName} imported succesfully.`);
        })
        .catch((err)=>{
          $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
        })
      }
    })
  };
  
  $scope.getBackupByTable = (ev, tableName)=>{
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
      let fileName = `jhora-${tableName}-${$mdDateLocale.formatDate(new Date())}.csv`;
      let backupPath = path.join(__dirname, fileName);
      fs.writeFile(backupPath, csv,  function (err) {
        if (err) throw err;
        $scope.showAlertDialog(ev, 'Backup', `Backup for ${tableName} is done.`)
      });
    })
    .catch((err)=>{
      $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
    });
  };
  
  $scope.deleteByTable = (ev, tableName)=>{
    q.deleteTableByName(tableName)
    .then((rows)=>{
      $scope.showAlertDialog(ev, 'Delete', `Table ${tableName} deleted.`)
    })
    .catch((err)=>{
      $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
    });
  };
  
  

});