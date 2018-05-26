
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

 $scope.customer = $rootScope.viewPassbookData;
 
 $scope.sortBy = function(propertyName) {
   $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
   $scope.propertyName = propertyName;
 };
 
 $scope.getCustomerPassbook = (tableName)=>{
      q.selectAllById(tableName, 'customerId', $rootScope.viewPassbookData.id)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = new Date(row.date);
          row.promiseDate = new Date(row.promiseDate);
        }
        $scope.transactions = rows; 
      })
      .catch((err)=>{
        console.error(err);
      });
    };

    $scope.getCustomerPassbook(TRANSACTION_TABLE);
  });