
jhora.controller('updateTransactionCtrl', function($rootScope, $scope, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {
    
    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };
    
    $scope.editMode = $rootScope.editMode;
    $scope.editModeData = $rootScope.editModeData;
    $rootScope.editMode = false;
    $rootScope.editModeData = {};
    $scope.transaction = $scope.editMode ? $scope.editModeData : $scope.transaction;
    
    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.minPromiseDate = new Date();
    $scope.maxPromiseDate = $scope.transaction.date ? new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate()) : new Date($scope.transaction.date.getFullYear() , $scope.transaction.date.getMonth() +1 , $scope.transaction.date.getDate());
    $scope.disablePromiseDate = true;
    
    $scope.cancelUpdate = () =>{
      $rootScope.template = {title: 'Transaction', content :'transaction/viewTransaction.html'};
    };
    
    $scope.dateSelected =()=>{
      $scope.minPromiseDate = $scope.transaction.date;
      $scope.maxPromiseDate = new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate());
      $scope.disablePromiseDate = false;
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
    
    $scope.updateTransaction= ()=>{
      $scope.updateSelectedCust($scope.transaction.customerId)
      $scope.transaction.name = $scope.customer.name;
      $scope.transaction.village = $scope.customer.village;
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
          $rootScope.template = {title: 'Trasactions', content:'transaction/viewTransaction.html'}
      })
      .catch((err)=>{
          console.error('anp err occured while insertion')
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
    
    $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);
    
  });