
jhora.controller('viewTransactionCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, TRANSACTION_TYPES, VIEW_LIMITS, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    $scope.types = TRANSACTION_TYPES;
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };
    $scope.transactions = [];
    $scope.hideNoDataFound = true;
    $scope.tran = {FromDate: undefined, ToDate: undefined};
    $scope.tran.FromDate = new Date();
    $scope.tran.ToDate = new Date();

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
           let  {amount, rate, date, promiseDate, type, customerId, name, village, remarks } = transaction;
           let keys = ['amount', 'rate', 'date', 'promiseDate', 'type', 'customerId', 'name', 'village', 'remarks' ];
           let values =[amount,rate, date, promiseDate, type, customerId, name, village, remarks];
            q.insert(DELTRANSACTION_TABLE, keys, values)
            .then((data)=>{
              return q.deleteRowById(TRANSACTION_TABLE, transaction.id);
            })
            .then((data)=>{
              $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
              dialog.showMessageBox({type :'info', message:`${transaction.name}'s transaction deleted`, buttons:[]});
            })
            .catch((err)=>{
              console.error('anp an err occured while deleting',err);
            });
          }
      })
    };

    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
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
        $timeout(()=>{
          $scope[modelName] = rows;
          if(tableName == TRANSACTION_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        }, 0);
      })
      .catch((err)=>{
        console.error(err);
        console.log(err);
      });
    };

    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getDataByTable(DELTRANSACTION_TABLE, TRANSACTION_TABLE);
      }else{
        $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
      }
    }

    $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);

    $scope.getTransaction=()=>{
      $scope.tran.FromDate = $mdDateLocale.parseDate($scope.tran.FromDate);
      $scope.tran.ToDate = $mdDateLocale.parseDate($scope.tran.ToDate);
      q.selectDataByDates(TRANSACTION_TABLE,'date',$scope.tran.FromDate,$scope.tran.ToDate)
       .then((rows)=>{
         console.log(rows);
         $timeout(()=>{
         if(rows){
         $scope.transactions= rows;
         console.log($scope.transactions);
         $scope.hideNoDataFound = true;
       } else {
         $scope.hideNoDataFound = false;
       }
     },0)
     })
      console.log($scope.transactions);
      console.log($scope.tran.FromDate);
      console.log($scope.tran.ToDate);

    }
  });
