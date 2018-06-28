jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, TRANSACTION_TABLE, CUSTOMERS_TABLE, DELTRANSACTION_TABLE, DELCUSTOMERS_TABLE,VILLAGE_TABLE){
  
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
  
  $scope.import = (ev)=>{
    let options = {title:'select files to upload', properties:['openFile', 'multiSelections', 'message']}
    dialog.showOpenDialog(options, (filePaths)=>{
      console.log('anp file filePaths', filePaths);
      const csvFilePath= filePaths && filePaths[0] ? filePaths[0] : '';
      if(csvFilePath)
      csv2json()
      .fromFile(csvFilePath)
      .then((jsonObj)=>{
        $scope.showAlertDialog(ev, 'Import', `Import coming soon.`);
          console.log('anp c2j', jsonObj);
      })
    })
    
  };
  
  $scope.getBackupByTable = (ev, tableName)=>{
    q.selectAll(tableName)
    .then((rows)=>{
      let fields;
      if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE){
        fields = ['id', 'name', 'village', 'amount', 'rate', 'customerId', 'date', 'promiseDate', 'remarks', 'type'];
      }else if (tableName == CUSTOMERS_TABLE || tableName == DELCUSTOMERS_TABLE){
        fields = ['id', 'salutation', 'name', 'pageNo', 'village', 'mobile', 'father', 'rate', 'guarantor', 'date', 'remarks'];
      }else if (tableName == VILLAGE_TABLE){
        fields = ['id', 'name'];
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
      console.error('anp got error while fetching data',err);
    });
  };

});
