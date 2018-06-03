
jhora.controller('updateTransactionCtrl', function($rootScope, $scope, $mdDateLocale, $timeout,$mdDialog,$mdToast, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };
    $scope.editModeData = $rootScope.editModeData;
    $rootScope.editModeData = {};
    $scope.transaction = $scope.editModeData ;
    $scope.type = '';
     if($scope.customer.type == 'Mrs'){
  $scope.type = 'W/o' ;
 }else if($scope.customer.type == 'Mr.'){
  $scope.type = 'S/o' ;
}else{
  $scope.type = 'D/o' ;
}

    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.minPromiseDate = $scope.transaction.date ? $scope.transaction.date : new Date();
   // $scope.maxPromiseDate = $scope.transaction.date ? new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate()) : new Date($scope.transaction.date.getFullYear() , $scope.transaction.date.getMonth() +1 , $scope.transaction.date.getDate());
    $scope.disablePromiseDate = $scope.transaction.type == 'Settle' ? true :false;

    $scope.cancelUpdate = () =>{
      $rootScope.template = {title: 'Transaction', content :'transaction/viewTransaction.html'};
    };

    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.typeSelected= ()=>{
      if ($scope.transaction.type == "Settle") {
        $scope.disablePromiseDate = true;
      } else {
        $scope.disablePromiseDate = false;
      }
    }
    $scope.viewCustomerPassbook = (customer)=>{
     // TODO
     $rootScope.viewPassbookData = customer;
     $rootScope.template = {title: `Passbook for A/c No.-${customer.id}` , content :'passbook/viewPassbook.html'};
    };

    $scope.dateSelected =()=>{
      $scope.minPromiseDate = $scope.transaction.date;
      $scope.maxPromiseDate = new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate());
      if ($scope.transaction.type == "Settle" || $scope.transaction.type == "Cr") {
        $scope.disablePromiseDate = true;
      }
      else {
        $scope.disablePromiseDate = false;
      }
    };

    $scope.updateSelectedCust = (customerId)=>{
      for(let cust of $scope.customers){
        if(cust.id == customerId){
          $scope.customer = cust;
        }
      }
    };
    $scope.resetTransaction = ()=>{
      $scope.transaction ={};
      $scope.customer ={};
      $scope.transactionForm.$setPristine();
      $scope.transactionForm.$setUntouched();
    };
    $scope.confirmTransaction=(ev,transaction)=>{
      $mdDialog.show({
     controller: ($scope, $mdDialog)=>{
       $scope.transaction = transaction;
       $scope.answer = function(answer) {
       $mdDialog.hide(answer);
     };
   },
     templateUrl: 'transaction/previewTransaction.html',
     parent: angular.element(document.body),
     targetEvent: ev,
     clickOutsideToClose:false,
     fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
   })
   .then(function(answer) {
     if(answer == 'submit') {
       $scope.updateTransaction(ev);
     }
   });
  }

    $scope.updateTransaction= (ev)=>{
      $scope.updateSelectedCust($scope.transaction.customerId);
      $scope.transaction.name = $scope.customer.name;
      $scope.transaction.village = $scope.customer.village;
      let date = $mdDateLocale.parseDate($scope.transaction.date);
      let promiseDate = $mdDateLocale.parseDate($scope.transaction.promiseDate);
      let keys = Object.keys($scope.transaction);
      let indexDate = keys.indexOf('date');
      let indexPdate = keys.indexOf('promiseDate');
      let values = Object.values($scope.transaction);
      values[indexDate] = date;
      values[indexPdate] = promiseDate;
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
        $timeout (()=>{
          $mdToast.show(
          $mdToast.simple()
          .textContent('Transaction updated.')
          .position('bottom right')
          .hideDelay(3000)
          );
          $scope.resetTransaction();
          $rootScope.template = {title: 'Trasactions', content:'transaction/viewTransaction.html'}
        },0)
      })
      .catch((err)=>{
          console.error('anp err occured while insertion',err);
      });
    };

    $scope.getDataByTable = (tableName, modelName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date): undefined;
          if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : undefined;
        }
        $timeout( ()=>{
        $scope[modelName] = rows;
        if(tableName == CUSTOMERS_TABLE)
        $scope.updateSelectedCust($scope.transaction.customerId);
      },0)
      })
      .catch((err)=>{
        console.error(err);
      });
    };

    $scope.getCustomerPassbook = (tableName)=>{
         q.selectAllById(tableName, 'customerId', $scope.transaction.customerId)
         .then((rows)=>{
           if(rows)
           for(let row of rows){
             row.date = row.date ? new Date(row.date) : undefined;
             row.promiseDate = row.promiseDate ? new Date(row.promiseDate) :undefined;
           }
           $scope.transactions = rows;
         })
         .catch((err)=>{
           console.error(err);
         });
     };

    $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);
    $scope.getCustomerPassbook(TRANSACTION_TABLE);

  });
