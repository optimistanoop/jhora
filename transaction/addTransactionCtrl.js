
jhora.controller('addTransactionCtrl', function($rootScope, $scope, $timeout, $mdDateLocale,$routeParams,$window, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE,passbookService,BALANCE_TABLE,BALANCE_COLUMNS) {

    $rootScope.template = {title:'Add Transaction'};
    $scope.custId = $routeParams.id;
    $scope.types = TRANSACTION_TYPES;
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.transactions = [];
    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.minPromiseDate = new Date();
    $scope.maxPromiseDate = new Date();
    $scope.disablePromiseDate = true;
    $scope.salutation = '';
    $scope.dueBal = '';
    $scope.typeSelected= (ev)=>{
      $scope.disablePromiseDate = true;
      $scope.transaction.amount = '';
      if(($scope.transaction.type == "Settle" || $scope.transaction.type == "Cr") && !$scope.transactions.length){
        $rootScope.showAlertDialog(ev, 'Error', 'Please add Dr as first transaction of customer.')
      }else if ($scope.transaction.type == "Settle") {
        $rootScope.showAlertDialog(ev, 'Alert', 'You have selected settle, please verify.')
        $scope.disablePromiseDate = true;
        $scope.transaction.amount = $scope.dueBal;
      }else if($scope.transaction.type == "Cr"){
        $scope.transaction.amount = '';
        $scope.disablePromiseDate = true;
      } else if($scope.transaction.date && $scope.transaction.type == 'Dr'){
        $scope.disablePromiseDate = false;
        $scope.transaction.amount = '';
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
        $scope.transaction.type == "Settle" && passbookService.calculateFinalPSI($scope.transactions, $scope.transaction.date).then((calc)=>{
                         let balData = calc.results[calc.results.length-1][0];
                         $scope.calcData = calc;
                         $scope.dueBal = balData ? balData.total : 0;
                         $scope.transaction.amount = $scope.dueBal;
                       })
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

    $scope.insertTransactionAndBalance = (keys =[], values=[])=>{
      //let {keys, values} = $scope.dataMassage();
      return q.insert(TRANSACTION_TABLE, keys, values)
      .then((data)=>{
        return q.selectAllById(BALANCE_TABLE, 'customerId', $scope.transaction.customerId)
      })
      .then((trans)=>{
        if(trans.length) {
          return passbookService.getUserData($scope.transaction.customerId)
              .then((calc)=>{
                let balData = calc.results[calc.results.length-1][0];
                let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId)
              })
        } else {
          return passbookService.getUserData($scope.transaction.customerId)
              .then((calc)=>{
                let balData = calc.results[calc.results.length-1][0];
                let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                q.insert(BALANCE_TABLE, BALANCE_COLUMNS, values)
              })
        }
      })
    };

    $scope.processSettle = (ev)=>{
      let discount = $scope.dueBal - $scope.transaction.amount;
      if(discount < 0){
        $scope.showAlertDialog(ev, 'Error', `Amount should not be greater than due balanace.`);
      }else if(discount){
        $scope.showConfirmDialog(ev, 'Alert', `Are you sure for Rs. ${discount} discount ?`)
        .then((data)=>{
          if(data){
            // add transaction
            // add discount
            // inactive all trans
            let {keys, values} = $scope.dataMassage();
            return $scope.insertTransactionAndBalance(keys, values)
          }
          throw Error;
        })
        .then((data)=>{
          $scope.transaction.remarks = $scope.transaction.amount;
          $scope.transaction.amount = discount;
          $scope.transaction.type = 'Discount';
          let {keys, values} = $scope.dataMassage();
          return $scope.insertTransactionAndBalance(keys, values)
        })
        .then((data)=>{
          return q.updateActiveStatus(TRANSACTION_TABLE, 'active', '0', 'customerId', $scope.transaction.customerId);
        })
        .then((data)=>{
          $timeout(()=>{
            $scope.resetTransaction();
            $rootScope.showToast('Transaction Added');
          },0);
        })
        .catch((err)=>{
          $scope.showAlertDialog(ev, 'Error', err);
        });
      }else {
        let {keys, values} = $scope.dataMassage();
        $scope.insertTransactionAndBalance(keys, values)
        .then((data)=>{
          return q.updateActiveStatus(TRANSACTION_TABLE, 'active', '0', 'customerId', $scope.transaction.customerId);
        })
        .then((data)=>{
          $timeout(()=>{
            $scope.resetTransaction();
            $rootScope.showToast('Transaction Added');
          },0);
      })
    }
  }

    $scope.processAddTransaction = (ev)=>{
      let {keys, values} = $scope.dataMassage();
      return $scope.insertTransactionAndBalance(keys, values)
      .then((data)=>{
        $timeout(()=>{
          $scope.resetTransaction();
          $rootScope.showToast('Transaction Added');
        },0);
      })
      .catch((err)=>{
        $scope.showAlertDialog(ev, 'Error', `While transaction insertion ${err}`);
      });
    };
    
    let validateFirstTransaction = (ev)=>{
      if(!$scope.transactions.length && ($scope.transaction.type == 'Settle' || $scope.transaction.type == 'Cr')){
        $scope.showAlertDialog(ev, 'Error', `Please select Dr as first transaction for customer.`);
        return false
      }else if($scope.transactions.length && $scope.transaction.type == 'Settle' && $scope.transactions[$scope.transactions.length -1].date > $scope.transaction.date){
        $scope.showAlertDialog(ev, 'Error', `Settle should be the last transaction.`);
        return false;
      }
      return true;
    }
    
    
    $scope.addTransaction = (ev)=>{
      let valid =  validateFirstTransaction(ev);
      if(valid && $scope.transaction.type == 'Settle'){
        $scope.processSettle(ev);
      }else if(valid){
        $scope.processAddTransaction(ev);
      }
    }

    $scope.getDataByTable = (tableName, modelName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows.length)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
          if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
        }
        $scope[modelName] = rows;
      })
      .catch((err)=>{
        $scope.showAlertDialog({}, 'Error', err);
      });
    };

    $scope.getCustomerPassbook = (tableName,column,value)=>{
        q.selectAllByIdActive(tableName, 'customerId', $scope.customer.id,column,value)
         .then((rows)=>{
           if(rows.length)
           for(let row of rows){
             row.date = row.date ? new Date(row.date) : null;
             row.promiseDate = row.promiseDate  ? new Date(row.promiseDate) : null;
           }

           $timeout(function() {
             $scope.transactions = rows;
             passbookService.calculateFinalPSI(rows, new Date())
               .then((calc)=>{
                 let balData = calc.results[calc.results.length-1][0];
                 $scope.calcData = calc;
                 $scope.dueBal = balData ? balData.total : 0;
               })
           })
         })
         .catch((err)=>{
           $scope.showAlertDialog({}, 'Error', err);
         });
     };
    $scope.init = ()=>{
      if($scope.custId) {
        q.selectAllById(CUSTOMERS_TABLE,'id',$scope.custId)
         .then((data)=>{
           $timeout(function() {
          $scope.nameDisable =true;
           $scope.updateSelectedCust(data[0]);
           })
        })
      }else{
         $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);
         $scope.nameDisable = false;
      }
    }

    $scope.init();
});
