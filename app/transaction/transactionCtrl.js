
jhora.controller('transactionCtrl', function($scope, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    $scope.types = TRANSACTION_TYPES;
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', customer: '', address:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', address: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };
    
    $scope.editTransaction = (transaction)=>{
      console.log('anp edit', transaction);
    };
    
    $scope.deleteTransaction = (transaction)=>{
      shell.beep()
      dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: `Are you sure you want to delete ${transaction.customer}'s transaction'?`
      }, function (response) {
          if (response === 0) {
           let  {amount, date, promiseDate, type, customerId, customer, address, remarks } = transaction;
           let keys = ['amount', 'date', 'promiseDate', 'type', 'customerId', 'customer', 'address', 'remarks' ];
           let values =[amount, date, promiseDate, type, customerId, customer, address, remarks];
            q.insert(DELTRANSACTION_TABLE, keys, values)
            .then((data)=>{
              return q.deleteRowById(TRANSACTION_TABLE, transaction.id);
            })
            //q.deleteRowById('transactions', transaction.id)
            .then((data)=>{
              $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
              dialog.showMessageBox({type :'info', message:`${transaction.customer}'s transaction deleted`, buttons:[]});
            })
            .catch((err)=>{
              console.error('anp an err occured while deleting', transaction);
            });
          }
      })
    };
    
    $scope.resetTransaction = ()=>{
      $scope.transaction ={};
      $scope.customer ={};
      $scope.transactionForm.$setPristine();
      $scope.transactionForm.$setUntouched(); 
    };
    
    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };
    
    $scope.submitTransaction = ()=>{
      $scope.transaction.customerId = $scope.customer.id;
      $scope.transaction.customer = $scope.customer.name;
      $scope.transaction.address = $scope.customer.address;
      let keys = Object.keys($scope.transaction);
      let values = Object.values($scope.transaction);
      q.insert(TRANSACTION_TABLE, keys, values)
      .then((data)=>{
          $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
          $scope.resetTransaction();
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
      })
      .catch((err)=>{
          console.error('anp err, transaction insertion', err);
      });
    };
    
    $scope.getDataByTable = (tableName, modelName)=>{
      q.selectAll(tableName)
      .then((rows)=>{  
        if(rows)
        for(let row of rows){
          row.date = new Date(row.date);
          if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)  
          row.promiseDate = new Date(row.promiseDate);
        }
        $scope[modelName] = rows;  
      })
      .catch((err)=>{
        console.error(err);
      });
    };
    
    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getDataByTable(DELTRANSACTION_TABLE, TRANSACTION_TABLE);
      }else{
        $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
      }
    }
    
    $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
    $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);
    
  });