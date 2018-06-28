jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, TRANSACTION_TABLE, CUSTOMERS_TABLE){
  
  $rootScope.template = {title: 'Setting'};
  $scope.msg = 'Check your backup in downloads folder once its done. Example File Name : jhora-customers-02-10-18.csv';
  const json2csv = require('json2csv').parse;
  const fs = require('fs');
  const path = require('path');
  const {app} = require('electron').remote;

  $scope.backup = (ev)=>{
    $scope.getBackupByTable(ev, CUSTOMERS_TABLE);
    $scope.getBackupByTable(ev, TRANSACTION_TABLE);  
    $scope.getBackupByTable(ev, DELCUSTOMERS_TABLE);  
    $scope.getBackupByTable(ev, DELTRANSACTION_TABLE);  
    $scope.getBackupByTable(ev, VILLAGE_TABLE);  
  };
  
  $scope.getBackupByTable = (ev, tableName)=>{
    q.selectAll(tableName)
    .then((rows)=>{
      let fields;
      if(tableName == TRANSACTION_TABLE){
        fields = ['id', 'name', 'village', 'amount', 'rate', 'customerId', 'date', 'promiseDate', 'remarks', 'type'];
      }else if (tableName == CUSTOMERS_TABLE){
        fields = ['id', 'salutation', 'name', 'pageNo', 'village', 'mobile', 'father', 'rate', 'guarantor', 'date', 'remarks'];
      }
      const opts = { fields };      
      const csv = json2csv(rows, opts);
      let dir = app.getPath('downloads');
      let fileName = `jhora-${tableName}-${$mdDateLocale.formatDate(new Date())}.csv`;
      let backupPath = path.join(dir, fileName);
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
