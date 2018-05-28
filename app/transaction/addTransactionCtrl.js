
jhora.controller('addTransactionCtrl', function($rootScope, $scope, $timeout, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };

    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.minPromiseDate = new Date();
    $scope.maxPromiseDate = new Date();
    $scope.disablePromiseDate = true;

    $scope.cancelUpdate = () =>{
      $rootScope.template = {title: 'Transaction', content :'transaction/viewTransaction.html'};
    };

    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.viewCustomerPassbook = (customer)=>{
     // TODO
     $rootScope.viewPassbookData = customer;
     $rootScope.template = {title: `Passbook for A/c No.-${customer.id}` , content :'passbook/viewPassbook.html'};
    };

    $scope.dateSelected =()=>{
      $scope.minPromiseDate = $scope.transaction.date;
      $scope.maxPromiseDate = new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate());
      if ($scope.transaction.type == "Settle") {
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
          $scope.transaction.rate = $scope.customer.rate;
          $scope.getCustomerPassbook(TRANSACTION_TABLE);
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
      $scope.transaction.name = $scope.customer.name;
      $scope.transaction.village = $scope.customer.village;
      $scope.transaction.promiseDate = $scope.transaction.promiseDate ? $scope.transaction.promiseDate: '';
      let keys = Object.keys($scope.transaction);
      let values = Object.values($scope.transaction);
      q.insert(TRANSACTION_TABLE, keys, values)
      .then((data)=>{
        $timeout(()=>{
          $scope.resetTransaction();
        },0);
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
          row.date = row.date ? new Date(row.date) : undefined;
          if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : undefined;
        }
        $scope[modelName] = rows;
      })
      .catch((err)=>{
        console.error(err);
      });
    };

    $scope.getCustomerPassbook = (tableName)=>{
         q.selectAllById(tableName, 'customerId', $scope.customer.id)
         .then((rows)=>{
           if(rows)
           for(let row of rows){
             row.date = row.date ? new Date(row.date) : undefined;
             row.promiseDate = row.promiseDate  ? new Date(row.promiseDate) : undefined;
           }
           $scope.transactions = rows;
         })
         .catch((err)=>{
           console.error(err);
         });
     };
    $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);

  });
