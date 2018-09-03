
jhora.controller('addTransactionCtrl', function($rootScope, $scope, $timeout, $mdDateLocale,$routeParams,$window, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE,passbookService,BALANCE_TABLE,BALANCE_COLUMNS) {

    $rootScope.template = {title:'Add Transaction'};
    $scope.custId = $routeParams.id;
    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.minPromiseDate = new Date();
    $scope.maxPromiseDate = new Date();
    $scope.disablePromiseDate = true;
    $scope.salutation = '';
    
    $scope.typeSelected= (ev)=>{
      $scope.disablePromiseDate = true;
      if ($scope.transaction.type == "Settle" || $scope.transaction.type == "Cr") {
        $scope.transaction.type == "Settle" && $rootScope.showAlertDialog(ev, 'Alert', 'You have selected settle, please verify.')
        $scope.disablePromiseDate = true;
      } else if($scope.transaction.date && $scope.transaction.type == 'Dr'){
        $scope.disablePromiseDate = false;
      }
    };
    
    $scope.onRateChange = (ev)=>{
      if($scope.transaction.rate == 0){
        $rootScope.showAlertDialog(ev, 'Alert', 'You have changed rate, please verify.')
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
          $scope.getCustomerPassbook(TRANSACTION_TABLE,'active',1);
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

    $scope.dataMassage = ()=>{
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
      return {keys, values};
    }

    $scope.addTransaction = ()=>{
      let {keys, values} = $scope.dataMassage();
      console.log("customer",$scope.transaction.customerId);
      q.insert(TRANSACTION_TABLE, keys, values)
      .then((data)=>{
        return q.selectAllByIdActive(TRANSACTION_TABLE, 'customerId', $scope.transaction.customerId,'active',1)
      })
      .then((trans)=>{
        if(trans.length>1) {
          return passbookService.getUserData($scope.transaction.customerId)
              .then((calc)=>{
                let balData = calc.results[calc.results.length-1][0];
                let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId)
              })
        }
        else {
          return passbookService.getUserData($scope.transaction.customerId)
              .then((calc)=>{
                let balData = calc.results[calc.results.length-1][0];
                let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                q.insert(BALANCE_TABLE, BALANCE_COLUMNS, values)
              })
        }
      })
      .then((data)=>{
        $timeout(()=>{
          $scope.resetTransaction();
          $rootScope.showToast('Transaction Added');
        },0);
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

    if($scope.custId) {
      q.selectAllById(CUSTOMERS_TABLE,'id',$scope.custId)
      .then((data)=>{
        $timeout(function() {
        $scope.updateSelectedCust(data[0]);
        })
      })
    }
    $scope.getCustomerPassbook = (tableName,column,value)=>{
         q.selectAllByIdActive(tableName, 'customerId', $scope.customer.id,column,value)
         .then((rows)=>{
           if(rows)
           for(let row of rows){
             row.date = row.date ? new Date(row.date) : null;
             row.promiseDate = row.promiseDate  ? new Date(row.promiseDate) : null;
           }
           $timeout(function() {
             $scope.transactions = rows;
           })
         })
         .catch((err)=>{
           console.error(err);
         });
     };
  $scope.back =()=>{
    $window.history.back();
  }
  $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);

});
