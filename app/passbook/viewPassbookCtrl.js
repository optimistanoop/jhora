
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

 $scope.customer = $rootScope.viewPassbookData;
 $scope.hideNoDataFound = true;


 $scope.sortBy = function(propertyName) {
   $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
   $scope.propertyName = propertyName;
 };

 $scope.editTransaction = (transaction)=>{
   //TODO
   $rootScope.editModeData = transaction;
   $rootScope.template = {title: 'Edit Transaction', content :'transaction/updateTransaction.html'};
 };

 $scope.deleteTransaction = (transaction)=>{
   shell.beep()
   dialog.showMessageBox({
       type: 'question',
       buttons: ['Yes', 'No'],
       title: 'Confirm',
       message: `Are you sure you want to delete ${transaction.name}'s transaction'?`
   }, function (response) {
       if (response === 0) {
        let  {amount, date, promiseDate, type, customerId, name, village, remarks } = transaction;
        let keys = ['amount', 'date', 'promiseDate', 'type', 'customerId', 'name', 'village', 'remarks' ];
        let values =[amount, date, promiseDate, type, customerId, name, village, remarks];
         q.insert(DELTRANSACTION_TABLE, keys, values)
         .then((data)=>{
           return q.deleteRowById(TRANSACTION_TABLE, transaction.id);
         })
         .then((data)=>{
           $scope.getCustomerPassbook(TRANSACTION_TABLE);
           dialog.showMessageBox({type :'info', message:`${transaction.name}'s transaction deleted`, buttons:[]});
         })
         .catch((err)=>{
           console.error('anp an err occured while deleting', transaction);
         });
       }
   })
 };

 $scope.getCustomerPassbook = (tableName)=>{
      q.selectAllById(tableName, 'customerId', $rootScope.viewPassbookData.id)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : undefined;
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : undefined;
        }
        $timeout(()=>{
          $scope.transactions = rows;
          if(tableName == TRANSACTION_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        },0);
      })
      .catch((err)=>{
        console.error(err);
      });
  };

  $scope.getCustomerPassbook(TRANSACTION_TABLE);
  $scope.Back = ()=>{
    $rootScope.template = {title: 'Customers', content:'customer/viewCustomer.html'}
  }
  });
