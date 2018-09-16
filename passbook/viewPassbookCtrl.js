
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, $routeParams,$window,$mdDateLocale, passbookService, TRANSACTION_TYPES, TRANS_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE,BALANCE_TABLE,BALANCE_COLUMNS) {

  $rootScope.template = {title: 'Passbook'};
  $scope.custid=$routeParams.id;
  $scope.limits = TRANS_LIMITS;
  $scope.queryFor = $scope.limits[0];
  $scope.customer = {};
  $scope.calcDate = new Date($mdDateLocale.parseDate(new Date()));
  $scope.deleteDate = new Date();
  let deletedOn =  $mdDateLocale.parseDate($scope.deleteDate);
  $scope.init = ()=> {
    q.selectAllById(CUSTOMERS_TABLE, 'id', $scope.custid)
    .then((rows)=>{
      $timeout(()=> {
        $scope.customer = rows[0];
        $rootScope.template.title=`${$scope.customer.name}'s Passbook`;
        $scope.setSalutation();
      },0)
      })
    };

  $scope.hideNoDataFound = true;
  $scope.setSalutation =()=> {
    $scope.salutation = '';
    if($scope.customer.salutation == 'Mrs'){
      $scope.salutation = 'W/o' ;
    }else if($scope.customer.salutation == 'Mr'){
      $scope.salutation = 'S/o' ;
    }else{
      $scope.salutation = 'D/o' ;
    }
  }

  $scope.deleteTransaction=(ev,transaction)=>{
   $rootScope.showDialog(ev,'transaction', transaction, 'transaction/previewTransaction.html','Are you sure to delete...?')
    .then((answer)=>{
      if(answer == 'submit') {
        $scope.confirmTransaction(transaction);
      }
    });
  };

  $scope.confirmTransaction = (transaction)=>{
    let  {amount, rate, date, promiseDate, type, customerId, name, village, remarks } = transaction;
    let keys = ['amount', 'rate', 'date', 'promiseDate', 'type', 'customerId', 'name', 'village', 'remarks','deletedOn' ];
    let values =[amount,rate, date, promiseDate, type, customerId, name, village, remarks,deletedOn];
    let nDate = $mdDateLocale.parseDate(values[2]);
    let nPromiseDate = $mdDateLocale.parseDate(values[3]);
    values[2] = nDate;
    values[3] = nPromiseDate;
     q.insert(DELTRANSACTION_TABLE, keys, values)
     .then((data)=>{
       return q.updateStatus(TRANSACTION_TABLE, 'active', '2', 'id', transaction.id)
     })
     .then((data)=>{
      q.selectAllByIdActive(TRANSACTION_TABLE, 'customerId', transaction.customerId,'active',1)
        .then((trans)=>{
          if(trans.length) {
            passbookService.getUserData(transaction.customerId)
            .then((calc)=>{
              let balData = calc.results[calc.results.length-1][0];
              let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.dueFrom,balData.nextDueDate,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
              q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId)
            })
          }
          else {
            q.deleteTableByName('balances WHERE customerId = '+transaction.customerId)
          }
        })
       $timeout(()=> {
         $scope.getCustomerPassbook(TRANSACTION_TABLE,'active',1);
         $rootScope.showToast(`${transaction.name}'s Transaction Deleted`);
       },0)
     })
     .catch((err)=>{
       $scope.showAlertDialog({}, 'Error', err);
     });
  }

 $scope.getDataByTable = (tableName, modelName,column,value)=>{
   q.selectAllById(tableName,column,value)
   .then((rows)=>{
     if(rows.length)
     for(let row of rows){
       row.date = row.date ? new Date(row.date) : null;
       if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
       row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
     }
     $timeout(()=>{
       $scope.transactions= rows;
       $scope.hideNoDataFound = true;
       if(tableName == TRANSACTION_TABLE && rows && rows.length == 0)
       $scope.hideNoDataFound = false;
     }, 0);
   })
   .catch((err)=>{
     $scope.showAlertDialog({}, 'Error', err);
   });
 };

 $scope.getNewData= (queryFor)=>{
   	if(queryFor == $scope.limits[2]) {
     	$scope.getCustomerPassbook(DELTRANSACTION_TABLE,`'1'`,1);
 	} else if (queryFor == $scope.limits[1]){
		$scope.getCustomerPassbook(TRANSACTION_TABLE,'active','0');
 	}
   	else{
     	$scope.getCustomerPassbook(TRANSACTION_TABLE,'active','1');
   	}
 }

 $scope.getCustomerPassbook = (tableName,column,value)=>{
    q.selectAllByIdActive(tableName, 'customerId', $scope.custid,column,value)
    .then((rows)=>{
      if(rows.length>0){
      for(let row of rows){
        row.date = row.date ? new Date(row.date) : null;
        row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
      }
      $timeout(()=>{
        $scope.transactions = rows || [];
        $scope.minDate = $scope.transactions[0] ? $scope.transactions[0].date :new Date();
        let lastDate = $scope.transactions[$scope.transactions.length -1].date;
        $scope.maxDate = new Date(lastDate.getFullYear() + 5, lastDate.getMonth(), lastDate.getDate());
        calculatePSIToday($scope.calcDate);
        $scope.hideNoDataFound = true;
        if((tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE) && rows && rows.length == 0)
        $scope.hideNoDataFound = false;
      },0);
    }
    else {
      $scope.hideNoDataFound = false;
    }
    })
    .catch((err)=>{
      $scope.showAlertDialog({}, 'Error', err);
    });
  };

  let calculatePSIToday = (date)=>{
    passbookService.calculateFinalPSI($scope.transactions, date)
    .then((data)=>{
      $timeout(()=> {
        $scope.calcData = data;
        $scope.dueBal = $scope.calcData.results[$scope.calcData.results.length-1][0].total;
      },0)
    })
    .catch((err)=>{
      $scope.showAlertDialog({}, 'Error', err);
    });
  }

  $scope.calculatePSI = (date)=>{
    let fromDate = $mdDateLocale.parseDate( $scope.transactions[0].date);
    let calcDate = $mdDateLocale.parseDate( date );
    q.selectDataByDates(TRANSACTION_TABLE, 'date', fromDate, calcDate, 'customerId', $scope.custid)
    .then((rows)=>{
      if(rows.length)
      for(let row of rows){
        row.date = row.date ? new Date(row.date) : null;
        row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
      }
      $timeout(()=>{
        $scope.transactions = rows || [];
        calculatePSIToday(date);
        $scope.minDate = $scope.transactions[0] ? $scope.transactions[0].date :new Date();
        let lastDate = $scope.transactions[$scope.transactions.length -1].date;
        $scope.maxDate = new Date(lastDate.getFullYear() + 5, lastDate.getMonth(), lastDate.getDate());
        $scope.hideNoDataFound = true;
        if(rows && rows.length == 0)
        $scope.hideNoDataFound = false;
      },0);
    })
  }

  $scope.init();
  $scope.getCustomerPassbook(TRANSACTION_TABLE,'active',1);

});
