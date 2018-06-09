
jhora.controller('addTransactionCtrl', function($rootScope, $scope, $timeout, $mdDateLocale,$mdToast,$routeParams,$window, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.minPromiseDate = new Date();
    $scope.maxPromiseDate = new Date();
    $scope.disablePromiseDate = true;
    $scope.salutation = '';

    $scope.sortBy = (propertyName)=>{
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.viewCustomerPassbook = (customer)=>{
     // TODO
     $rootScope.viewPassbookData = customer;
     $rootScope.template = {title: `Passbook for A/c No.-${customer.id}` , content :'passbook/viewPassbook.html'};
    };
    
    $scope.typeSelected= ()=>{
      $scope.disablePromiseDate = true;
      if ($scope.transaction.type == "Settle" || $scope.transaction.type == "Cr") {
        $scope.disablePromiseDate = true;
      } else if($scope.transaction.date && $scope.transaction.type == 'Dr'){
        $scope.disablePromiseDate = false;
      }
    };

    $scope.dateSelected =()=>{
      $scope.minPromiseDate = $scope.transaction.date;
      $scope.maxPromiseDate = new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate());

      if ($scope.transaction.type == "Settle" || $scope.transaction.type == "Cr" ) {
        $scope.disablePromiseDate = true;
      }else if($scope.transaction.type == 'Dr') {
        $scope.disablePromiseDate = false;
      }
    };
    
    $scope.searchCustomer = (keyword)=>{
      let result = [];
      let customers = [];
      for(let cust of $scope.customers){
        cust.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1 ? result.push(cust) : customers.push(cust);
      }
      return result.length > 0 ? result :customers;
    };

    $scope.updateSelectedCust = (customer)=>{
        if(customer && customer.id){
          
          $scope.customer = customer;
          $scope.transaction.rate = $scope.customer.rate;
          if($scope.customer.salutation == 'Mrs'){
            $scope.salutation = 'W/o' ;
           }else if($scope.customer.salutation == 'Mr'){
             $scope.salutation = 'S/o' ;
          }else{
            $scope.salutation = 'D/o' ;
          }
          $scope.getCustomerPassbook(TRANSACTION_TABLE);
        }else{
          $scope.customer = null;
          $scope.transactions = [];
        }
    };
    $scope.resetTransaction = ()=>{
      $scope.transaction ={};
      $scope.customer = null;
      $scope.transactionForm.$setPristine();
      $scope.transactionForm.$setUntouched();
    };

    $scope.addTransaction = ()=>{
      $scope.transaction.customerId = $scope.customer.id;
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
      q.insert(TRANSACTION_TABLE, keys, values)
      .then((data)=>{
        $timeout(()=>{
          $scope.resetTransaction();
        },0);
        $mdToast.show(
        $mdToast.simple()
        .textContent('Transaction Added.')
        .position('bottom right')
        .hideDelay(3000)
        );
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
          row.date = row.date ? new Date(row.date) : null;
          if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
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
             row.date = row.date ? new Date(row.date) : null;
             row.promiseDate = row.promiseDate  ? new Date(row.promiseDate) : null;
           }
           $scope.transactions = rows;
         })
         .catch((err)=>{
           console.error(err);
         });
     };
    $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);

  });
