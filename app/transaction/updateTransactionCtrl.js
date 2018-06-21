
jhora.controller('updateTransactionCtrl', function($rootScope, $scope, $mdDateLocale, $timeout,$mdDialog,$routeParams,$window, TRANSACTION_TYPES, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    $rootScope.template = {title: 'Edit Transaction'};
    $scope.transid = $routeParams.id;
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };
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
      },0)
    )};

    $scope.setDefaults = ()=>{
      $scope.types = TRANSACTION_TYPES;
      $scope.customer = { salutation: '', name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: null, pageNo: '', remarks: '' };
      $rootScope.editModeData = {};
      $scope.salutation = '';
      $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
      $scope.maxDate = new Date();
      $scope.minPromiseDate = $scope.transaction.date ? $scope.transaction.date : new Date();
      $scope.maxPromiseDate = $scope.transaction.date ? new Date($scope.transaction.date.getFullYear() +1 , $scope.transaction.date.getMonth(), $scope.transaction.date.getDate()) : new Date($scope.transaction.date.getFullYear() , $scope.transaction.date.getMonth() +1 , $scope.transaction.date.getDate());
      $scope.disablePromiseDate = $scope.transaction.type == 'Settle' ? true :false;
    }


    $scope.cancelUpdate = () =>{
      $window.history.back();
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
      if ($scope.transaction.type == "Settle" || $scope.transaction.type == "Cr") {
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
    $scope.confirmTransaction=(ev,transaction)=>{

      $rootScope.showDialog(ev,'transaction', transaction, 'transaction/previewTransaction.html')
      .then((answer)=>{
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
          $rootScope.showToast('Transaction updated');
          $scope.resetTransaction();
          $window.history.back();
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
        console.error(err);
      });
    };

    $scope.getCustomerPassbook = (tableName)=>{
         q.selectAllById(tableName, 'customerId', $scope.transaction.customerId)
         .then((rows)=>{
           if(rows)
           for(let row of rows){
             row.date = row.date ? new Date(row.date) : null;
             row.promiseDate = row.promiseDate ? new Date(row.promiseDate) :null;
           }
           $scope.transactions = rows;
         })
         .catch((err)=>{
           console.error(err);
         });
     };

    $scope.init();
});
