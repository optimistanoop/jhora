

jhora.controller('viewTransactionCtrl', function($rootScope, $scope, $timeout, $mdDateLocale,$routeParams,$window, TRANSACTION_TYPES, VIEW_LIMITS, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    const {shell} = require('electron');
    $rootScope.template = {title: 'Transactions'};
    $scope.types = TRANSACTION_TYPES;
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: null, pageNo: '', remarks: '' };
    $scope.transactions = [];
    $scope.hideNoDataFound = true;
    $scope.tran = {fromDate: null, toDate: null};
    $scope.maxDate = new Date();

    $scope.deleteTransaction=(ev,transaction)=>{
      shell.beep()
      $rootScope.showDialog(ev,'transaction', transaction, 'transaction/previewTransaction.html','Are you sure to delete...?')
      .then(function(answer) {
        if(answer == 'submit') {
          $scope.confirmTransaction(transaction);
        }
      });
  }

  $scope.confirmTransaction = (transaction)=>{
    let  {amount, rate, date, promiseDate, type, customerId, name, village, remarks } = transaction;
    let keys = ['amount', 'rate', 'date', 'promiseDate', 'type', 'customerId', 'name', 'village', 'remarks' ];
    let values =[amount,rate, date, promiseDate, type, customerId, name, village, remarks];
    q.insert(DELTRANSACTION_TABLE, keys, values)
    .then((data)=>{
      return q.deleteRowById(TRANSACTION_TABLE, transaction.id);
    })
    .then((data)=>{
      $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
      $rootScope.showToast(`${transaction.name}'s Transaction Deleted`);
    })
    .catch((err)=>{
      console.error('anp an err occured while deleting',err);
    });
  }

  $scope.sortBy = (propertyName)=>{
    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
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
      $timeout(()=>{
        $scope[modelName] = rows;
        $scope.hideNoDataFound = true;
        if(tableName == TRANSACTION_TABLE && rows && rows.length == 0)
        $scope.hideNoDataFound = false;
      }, 0);
    })
    .catch((err)=>{
      console.error('anp got error while fetching data',err);
    });
  };

  $scope.getNewData= (queryFor)=>{
    if(queryFor == $scope.limits[1]) {
      $scope.getDataByTable(DELTRANSACTION_TABLE, TRANSACTION_TABLE);
    }else{
      $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);
    }
  }

  $scope.getTransaction=()=>{
    if($scope.tran.toDate) {
      $scope.startFilter = true;
      let fromDate = $mdDateLocale.parseDate($scope.tran.fromDate);
      let toDate = $mdDateLocale.parseDate($scope.tran.toDate);
      q.selectDataByDates(TRANSACTION_TABLE,'date',fromDate,toDate)
        .then((rows)=>{
          $timeout(()=>{
            if(rows)
            for(let row of rows){
              row.date = row.date ? new Date(row.date) : undefined;
              row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : undefined;
            }
          $scope.transactions= rows;
          $scope.hideNoDataFound = true;
          if (rows.length == 0) {
            $scope.hideNoDataFound = false;
          }
        },0)
      })
    }
  }

  $scope.clearFilter =(queryFor)=>{
    $scope.startFilter = false;
    $scope.tran.toDate = null;
    $scope.tran.fromDate = null;
    $scope.getNewData(queryFor);
  };

  $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE);

  });
