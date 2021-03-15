jhora.controller('settingCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, passbookService, TRANSACTION_TABLE, CUSTOMERS_TABLE, BALANCE_TABLE, BALANCE_HISTORY_TABLE, DELTRANSACTION_TABLE, DELCUSTOMERS_TABLE,VILLAGE_TABLE, CUSTOMERS_COLUMNS, TRANSACTION_EXPORT_COLUMNS,BALANCE_COLUMNS, BALANCE_HISTORY_COLUMNS, VILLAGE_COLUMNS){

  $rootScope.template = {title: 'Settings'};
  $scope.msg = `Check your exported file in <selected-folder>/jhorabackup/dd-mm-yy-hh-mm-ss folder once its done.`;
  $scope.msg2 = `Import steps- export (deault folder for export is /Downloads) -> delete -> import.`;
  $scope.msg3 = `Delete steps- export (select folder for export) -> delete.`;
  $scope.msg4 = `Example File Name : jhora-customers-dd-mm-yy-hh-mm.csv.`;
  $scope.msg5 = `All balance calculations for customers to be happen for todays date.`;
  $scope.showProgress = false;
  const json2csvConverter = json2csv.parse;
  const csv2jsonConverter = csv({output: "csv"});

  $scope.items = ['Transactions','Balances','Balances_History','Customers','Village'];
  $scope.selected = [TRANSACTION_TABLE,BALANCE_TABLE, BALANCE_HISTORY_TABLE];
  $scope.toggle = function (item, list) {
    item = item.toLowerCase();
    var idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(item);
    }
  };

  $scope.exists = function (item, list) {
    item = item.toLowerCase();
    return list.indexOf(item) > -1;
  };

  $scope.isIndeterminate = function() {
    return ($scope.selected.length !== 0 &&
        $scope.selected.length !== $scope.items.length);
  };

  $scope.isChecked = function() {
    return $scope.selected.length === $scope.items.length;
  };

  $scope.toggleAll = function() {
      if ($scope.selected.length === $scope.items.length) {
        $scope.selected = [];
      } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
        $scope.selected = $scope.items.slice(0).map(v => v.toLowerCase());;
      }
  };

  let deleteAllTables = (ev, tables=[])=>{
    let promises =[];
    for(let table of tables){
        promises.push($scope.deleteByTable(ev, table));
    }
    return Promise.all(promises);
  }
  let exportAlltables = (ev, tables=[])=>{
    let promises =[];
    for(let table of tables){
        promises.push($scope.getBackupByTable(ev, table));
    }
    return Promise.all(promises);
  }


  let exportBackupFile = (tableName, content, contentType = "application/json")=>{
      // download(jsonData, 'json.txt', 'text/plain');
      // download(jsonData, 'json.json', '"octet/stream");

    let today = new Date();
    let fileName = `jhora-${tableName}-${$mdDateLocale.formatDate(today)}-${today.getHours()}-${today.getMinutes()}.csv`;
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  $scope.export = (ev)=>{
    $scope.showProgress = true;
    exportAlltables(ev, $scope.selected)
    .then((data)=>{
      $scope.showProgress = false;
      $scope.showToast(`Backup for all data is done.`)
    });
};

  $scope.delete = (ev)=>{
    $scope.showConfirmDialog(ev, 'Delete all data', `Are you sure to delete all data ?`)
    .then((data)=>{
          $scope.showProgress = true;
          return exportAlltables(ev, $scope.selected)
          .then((data)=>{
            return deleteAllTables(ev, $scope.selected)
          })
          .then((data)=>{
            $scope.showProgress = false;
            $scope.showToast(`All Table data deleted.`)
            return true
          })
          .catch((err)=>{
            $scope.showAlertDialog(ev, 'Error', err);
          });
    })
  };
  $scope.import = (ev)=>{
      let filePaths = [];
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
            promises.push(csv2jsonConverter.fromFile(f)
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
          data.length && $scope.showToast(`All data imported succesfully.`);
          !data.length && $scope.showToast(`Nothing to import.`);
        })
        .catch((err)=>{
          $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
        })
  };

  $scope.getBackupByTable = (ev, tableName)=>{
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
        const csv = json2csvConverter(rows, opts);
        exportBackupFile(tableName, csv)
        resolve();
    });
  })
  .catch((err)=>{
    $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
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
      return q.wildCard('select c.uId from customers c left join balances b on c.uId= b.customerId where b.customerId is null')
    })
    .then((rows)=>{
      let promises = [];
      if(rows.length){
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
          promises.push(passbookService.getUserData(row.uId));
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
        $scope.showToast(`Balances Updated`);
        $rootScope.$emit('updateCustomers');
      }else{
        $scope.showToast('Nothing to update.');
      }
    })
  };

});
