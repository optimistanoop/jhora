
jhora.controller('updateTransactionCtrl', function($rootScope, $scope, $mdDateLocale, $timeout,$mdDialog,$routeParams,$window, UPDATE_TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE,BALANCE_TABLE,BALANCE_COLUMNS,passbookService) {

    $rootScope.template = {title: 'Edit Transaction'};
    $scope.transid = $routeParams.id;
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };

    $scope.onRateChange = (ev)=>{
      if($scope.transaction.rate == 0){
        $rootScope.showAlertDialog(ev, 'Alert', 'You have chaned rate, please verify.')
      }
    };

    $scope.init = ()=> {
      q.selectAllById(TRANSACTION_TABLE, 'id', $scope.transid)
      .then((rows)=>
        $timeout(()=> {
        $scope.transaction = rows[0];
        $scope.transaction.date = $scope.transaction.date ? new Date($scope.transaction.date) : undefined;
        $scope.transaction.promiseDate = $scope.transaction.promiseDate ? new Date($scope.transaction.promiseDate) : undefined;
        $scope.setDefaults();
        $scope.getDataByTable(CUSTOMERS_TABLE, CUSTOMERS_TABLE);
        $scope.getCustomerPassbook(TRANSACTION_TABLE);
        if($scope.transaction.active == 0) {
          $scope.active = true;
        }
        else {
          $scope.active = false;
        }
      },0)
    )};

    $scope.setDefaults = ()=>{
      $scope.types = UPDATE_TRANSACTION_TYPES;
      $scope.customer = { salutation: '', name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: null, pageNo: '', remarks: '' };
      $rootScope.editModeData = {};
      $scope.salutation = '';
      $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
      $scope.maxDate = new Date();
      $scope.minPromiseDate = $scope.transaction.date ? $scope.transaction.date : new Date();
      $scope.maxPromiseDate = $scope.transaction.date ? new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate()) : new Date($scope.transaction.date.getFullYear() , $scope.transaction.date.getMonth() +1 , $scope.transaction.date.getDate());
      $scope.disablePromiseDate = $scope.transaction.type == 'Settle' ? true :false;
    }

    $scope.typeSelected= (ev)=>{
      $scope.disablePromiseDate = true;
      if($scope.transaction.type == "Cr" && $scope.transactions.length  == 1){
        $rootScope.showAlertDialog(ev, 'Error', 'Please add Dr as first transaction of customer.')
      }
      if ($scope.transaction.type == "Cr") {
        $scope.disablePromiseDate = true;
      } else if($scope.transaction.date && $scope.transaction.type == 'Dr'){
        $scope.disablePromiseDate = false;
      }
    };

    $scope.dateSelected =()=>{
      $scope.minPromiseDate = $scope.transaction.date;
      $scope.maxPromiseDate = new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate());
      if ($scope.transaction.type == "Cr") {
        $scope.disablePromiseDate = true;
      }else if($scope.transaction.type == 'Dr'){
        $scope.disablePromiseDate = false;
      }
    };

    $scope.updateSelectedCust = (customerId)=>{
      for(let cust of $scope.customers){
        if(cust.id == customerId){
          $scope.customer = cust;
          if($scope.customer.salutation == 'Mrs'){
          $scope.salutation = 'W/o' ;
          }else if($scope.customer.salutation == 'Mr'){
          $scope.salutation = 'S/o' ;
          }else{
          $scope.salutation = 'D/o' ;
          }
        }
      }
    };
    $scope.resetTransaction = ()=>{
      $scope.transaction ={};
      $scope.customer ={};
      $scope.transactionForm.$setPristine();
      $scope.transactionForm.$setUntouched();
    };
    
    
    let validateFirstTransaction = (ev)=>{
      if($scope.transactions.length == 1 &&  $scope.transaction.type == 'Cr'){
        $scope.showAlertDialog(ev, 'Error', `Please select Dr as first transaction for customer.`);
        return false
      }else if($scope.transactions.length && $scope.transaction.type == 'Cr' && $scope.transactions[0].date > $scope.transaction.date){
        $scope.showAlertDialog(ev, 'Error', `Cr should should not be the first transaction.`);
        return false;
      }
      return true;
    }
    
    $scope.confirmTransaction=(ev,transaction)=>{
      if($scope.transaction.active == 0 ) {
        $scope.active = false;  
        q.update(TRANSACTION_TABLE, ['active'],['1'] , 'id', $scope.transaction.id)
        .then((data)=>{
          return passbookService.getUserData($scope.transaction.customerId)
              .then((calc)=>{
                let balData = calc.results[calc.results.length-1][0];
                let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId)
          })
        })
        .then((data)=>{
          $timeout (()=>{
            $rootScope.showToast('Trasaction Activated Successfully');
            $window.history.back();
          },0)
        })
      }
      else {
        let valid = validateFirstTransaction(ev);
        if(!valid) return;
        $rootScope.showDialog(ev,'transaction', transaction, 'transaction/previewTransaction.html')
        .then((answer)=>{
          if(answer == 'submit') {
            $scope.updateTransaction(ev);
          }
        });
    }
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
        return passbookService.getUserData($scope.transaction.customerId)
            .then((calc)=>{
              let balData = calc.results[calc.results.length-1][0];
              let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
              q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId)
        })
      })
      .then((data)=>{
        $timeout (()=>{
          $rootScope.showToast('Transaction updated');
          $scope.resetTransaction();
          $window.history.back();
        },0)
      })
      .catch((err)=>{
        $scope.showAlertDialog(ev, 'Error', `An err occured while operation ${err}`);
      });
    };

    $scope.getDataByTable = (tableName, modelName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows.length)
        for(let row of rows){
          row.date = row.date ? new Date(row.date): null;
          if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
        }
        $timeout( ()=>{
          $scope[modelName] = rows;
          if(tableName == CUSTOMERS_TABLE)
          $scope.updateSelectedCust($scope.transaction.customerId);
        },0)
      })
      .catch((err)=>{
        $scope.showAlertDialog({}, 'Error', err);
      });
    };

    $scope.getCustomerPassbook = (tableName)=>{
         q.selectAllByIdActive(tableName, 'customerId', $scope.transaction.customerId,'active',1)
         .then((rows)=>{
           if(rows.length)
           for(let row of rows){
             row.date = row.date ? new Date(row.date) : null;
             row.promiseDate = row.promiseDate ? new Date(row.promiseDate) :null;
           }
           $scope.transactions = rows;
           passbookService.calculateFinalPSI(rows, new Date())
             .then((calc)=>{
               let balData = calc.results[calc.results.length-1][0];
               $scope.calcData = calc;
               $scope.dueBal = balData ? balData.total : 0;
             })
         })
         .catch((err)=>{
           $scope.showAlertDialog({}, 'Error', err);
         });
     };

    $scope.init();
});
