
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {
 console.log("KV",$rootScope.viewPassbookData.id);
 $scope.getPassbookCustomer = (tableName)=>{
      q.selectAllById(tableName, $rootScope.viewPassbookData.id)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = new Date(row.date);
          row.promiseDate = new Date(row.promiseDate);
        }
        $scope.passbooks = rows; 
      })
      .catch((err)=>{
        console.error(err);
      });
    };

    $scope.getPassbookCustomer(TRANSACTION_TABLE);
  });