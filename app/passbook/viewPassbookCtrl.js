
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, $routeParams,$window,$mdDateLocale, passbookService, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {


  const {dialog} = require('electron').remote;
  const {shell} = require('electron');
  $rootScope.template = {title: 'Passbook'};
  $scope.custid=$routeParams.id;
  $scope.limits = VIEW_LIMITS;
  $scope.queryFor = $scope.limits[0];
  $scope.customer = {};
  //$scope.maxDate = new Date();
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
   shell.beep();
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
       return q.updateStatus(TRANSACTION_TABLE, 'active', '0', 'id', transaction.id)
     })
     .then((data)=>{
       $timeout(()=> {
         $scope.getCustomerPassbook(TRANSACTION_TABLE,'active',1);
         $rootScope.showToast(`${transaction.name}'s Transaction Deleted`);
       },0)
     })
     .catch((err)=>{
       console.error('anp an err occured while deleting',err);
     });
  }

 $scope.getDataByTable = (tableName, modelName,column,value)=>{
   q.selectAllById(tableName,column,value)
   .then((rows)=>{
     if(rows)
     for(let row of rows){
       row.date = row.date ? new Date(row.date) : null;
       if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
       row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
     }
     $timeout(()=>{
       // $scope[modelName] = rows;
       $scope.transactions= rows;
       // console.log('data',$scope[modelName]);
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
     $scope.getCustomerPassbook(DELTRANSACTION_TABLE,`'1'`,1);
   }else{
     $scope.getCustomerPassbook(TRANSACTION_TABLE,'active','1');
   }
 }

 $scope.getCustomerPassbook = (tableName,column,value)=>{
    q.selectAllByIdActive(tableName, 'customerId', $scope.custid,column,value)
    .then((rows)=>{
      if(rows)
      for(let row of rows){
        row.date = row.date ? new Date(row.date) : null;
        row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
      }
      $timeout(()=>{
        $scope.transactions = rows || [];
        $scope.minDate = $scope.transactions[0] ? $scope.transactions[0].date :new Date();
        let lastDate = $scope.transactions[$scope.transactions.length -1].date;
        $scope.maxDate = new Date(lastDate.getFullYear() + 5, lastDate.getMonth(), lastDate.getDate());
        calculatePSI();
        $scope.hideNoDataFound = true;
        if((tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE) && rows && rows.length == 0)
        $scope.hideNoDataFound = false;
      },0);
    })
    .catch((err)=>{
      console.error(err);
    });
  };

  $scope.back = ()=>{
    $window.history.back();
  };
  
  let calculatePSI = ()=>{
    passbookService.calculateFinalPSI($scope.transactions, $scope.calcDate)
    .then((data)=>{
      $timeout(()=> {
        $scope.calcData = data;
      },0)

    })
    .catch((err)=>{
      console.error('anp an error occured while operation', err);
    });
  }
  
  $scope.calculatePSI = ()=>{
    let fromDate = $mdDateLocale.parseDate( $scope.transactions[0].date);
    let calcDate = $mdDateLocale.parseDate( $scope.calcDate);
    q.selectDataByDates(TRANSACTION_TABLE, 'customerId', 'date', $scope.transactions[0].date, calcDate, $scope.custid)
    .then((rows)=>{  
      if(rows)
      for(let row of rows){
        row.date = row.date ? new Date(row.date) : null;
        row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
      }
      $timeout(()=>{
        $scope.transactions = rows || [];
        calculatePSI();
        $scope.minDate = $scope.transactions[0] ? $scope.transactions[0].date :new Date();
        let lastDate = $scope.transactions[$scope.transactions.length -1].date;
        $scope.maxDate = new Date(lastDate.getFullYear() + 5, lastDate.getMonth(), lastDate.getDate());
        $scope.hideNoDataFound = true;
        if((tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE) && rows && rows.length == 0)
        $scope.hideNoDataFound = false;
      },0);
    })
  }
 
  $scope.init();
  $scope.getCustomerPassbook(TRANSACTION_TABLE,'active',1);

});
