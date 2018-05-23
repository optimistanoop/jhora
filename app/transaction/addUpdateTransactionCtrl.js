
jhora.controller('addUpdateTransactionCtrl', function($rootScope, $scope, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {
    
    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', name: '', address:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', address: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };
    
    $scope.editMode = $rootScope.editMode;
    $scope.editModeData = $rootScope.editModeData;
    $rootScope.editMode = false;
    $rootScope.editModeData = {};
    $scope.transaction = $scope.editMode ? $scope.editModeData : $scope.transaction;
    $scope.transaction.date = new Date($scope.transaction.date);
    $scope.transaction.promiseDate = new Date($scope.transaction.promiseDate);
    $scope.submitBtnName = $scope.editMode ? 'Update' :'Submit';
    $scope.cancelUpdate = () =>{
      $rootScope.template = {title: 'Transaction', content :'transaction/transactionView.html'};
    };
    
    $scope.updateSelectedCust = (customerId)=>{
      for(let cust of $scope.customers){
        if(cust.id == customerId){
          $scope.customer = cust;
          console.log('cust',$scope.customer);
        }
      }
    };
    $scope.resetTransaction = ()=>{
      $scope.transaction ={};
      $scope.customer ={};
      $scope.transactionForm.$setPristine();
      $scope.transactionForm.$setUntouched(); 
    };
    
    $scope.addTransaction = ()=>{
      $scope.transaction.customerId = $scope.customer.id;
      $scope.transaction.name = $scope.customer.name;
      $scope.transaction.address = $scope.customer.address;
      let keys = Object.keys($scope.transaction);
      let values = Object.values($scope.transaction);
      q.insert(TRANSACTION_TABLE, keys, values)
      .then((data)=>{
          $scope.resetTransaction();
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
      })
      .catch((err)=>{
          console.error('anp err, transaction insertion', err);
      });
    };
    
    $scope.updateTransaction= ()=>{
      $scope.updateSelectedCust($scope.transaction.customerId)
      $scope.transaction.name = $scope.customer.name;
      $scope.transaction.address = $scope.customer.address;
      let keys = Object.keys($scope.transaction);
      let values = Object.values($scope.transaction);
      let index = keys.indexOf('$$hashKey');
      if (index > -1) {
        keys.splice(index, 1);
        values.splice(index, 1);
      }
      index = keys.indexOf('id');
      if (index > -1) {
        keys.splice(index, 1);
        values.splice(index, 1);
      }
      index = keys.indexOf('customerId');
      if (index > -1) {
        keys.splice(index, 1);
        values.splice(index, 1);
      }
      q.update(TRANSACTION_TABLE, keys, values, 'id', $scope.transaction.id)
      .then((data)=>{
          $scope.resetTransaction();
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
      })
      .catch((err)=>{
          console.error('anp err occured while insertion')
      });
    };
    
    $scope.submitTransaction = ()=>{
      $scope.editMode ?  $scope.updateTransaction(): $scope.addTransaction();
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
    
    $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);
    
  });