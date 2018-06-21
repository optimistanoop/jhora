
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, $routeParams,$window,$mdDateLocale, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {


  const {dialog} = require('electron').remote;
  const {shell} = require('electron');
  $rootScope.template = {title: 'Passbook'};
  $scope.custid=$routeParams.id;
  $scope.limits = VIEW_LIMITS;
  $scope.queryFor = $scope.limits[0];
  $scope.customer = {};
  $scope.maxDate = new Date();
  $scope.calcDate = new Date();
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
        $scope.transactions = rows;
        $scope.hideNoDataFound = true;
        if((tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE) && rows && rows.length == 0)
        $scope.hideNoDataFound = false;
      },0);
    })
    .catch((err)=>{
      console.error(err);
    });
  };

  $scope.Back = ()=>{
    $window.history.back();
  };

  $scope.calculate = ()=>{

    // get the dr
    for(let tran of $scope.transactions){

    }
    // calc SI


  };


  let caluclateSI = (p, r, t)=>{
    return p*r*t/100;
  };

  let getCalcDates = ()=>{
    //TODO  rotate over transactions and return the calc dates
    //TODO here the consideration should be either Cr/Dr based on first type or 1 yr of the transaction
    let result = [];
    let crPrinciple = 0;
    let drPrinciple = 0;
    let crInterest = 0;
    let drInterest = 0;
    let firstTranType = $scope.transaction[0].type;
    let firstTranDate = $scope.transaction[0].date;
    //let  firstTranDate= new Date($scope.transaction[0].date);
    let nextYrMergerDate = new Date(firstTranDate.getFullYear()+1, firstTranDate.getMonth(), firstTranDate.getDate());

    for(let tran of $scope.transactions){
      if(tran.date > nextYrMergerDate){
        // crPrinciple += tran.type == 'Cr' ? tran.amount : 0;
        // drPrinciple += tran.type == 'Dr' ? tran.amount : 0;
        // crInterest  += tran.type == 'Cr' ? $scope.calculate(tran.date, new Date()) : 0;
        // drInterest  += tran.type == 'Dr' ? $scope.calculate(tran.date, new Date()) : 0;
        // crPrinciple += tran.type == 'Cr' ? tran.amount : 0;
        // drPrinciple += tran.type == 'Dr' ? tran.amount : 0;
        // crInterest  += tran.type == 'Cr' ? $scope.calculate(tran.date, new Date()) : 0;
        // drInterest  += tran.type == 'Dr' ? $scope.calculate(tran.date, new Date()) : 0;
        firstTranDate = nextYrMergerDate;
        nextYrMergerDate = new Date(firstTranDate.getFullYear()+1, firstTranDate.getMonth(), firstTranDate.getDate());
      }
      if(tran.type != firstTranType){
        // crPrinciple += tran.type == 'Cr' ? tran.amount : 0;
        // drPrinciple += tran.type == 'Dr' ? tran.amount : 0;
        // crInterest  += tran.type == 'Cr' ? $scope.calculate(tran.date, new Date()) : 0;
        // drInterest  += tran.type == 'Dr' ? $scope.calculate(tran.date, new Date()) : 0;
        firstTranDate = tran.date;
        nextYrMergerDate = new Date(firstTranDate.getFullYear()+1, firstTranDate.getMonth(), firstTranDate.getDate());
      }
    }

    return '';
  };



  $scope.init();
  $scope.getCustomerPassbook(TRANSACTION_TABLE,'active',1);

  let getMonthDiff = (from, to)=>{

    from = new Date(from);
    to = new Date(to);
    let valid = !isNaN(from) && !isNaN(to) && from < to ;
    if(! valid) return [];
    let months = 0;
    let firstMonth = 0;
    let lastMonth = 0;
    months = (to.getFullYear() - from.getFullYear()) * 12;
    months -= from.getMonth() + 1;
    months += to.getMonth();
    months = months <= 0 ? 0 : months;

    firstMonth = from.getDate() <= 15 ? 1 :0.5;
    lastMonth = to.getDate() >= 15 ? 1 :0.5;
    return [firstMonth, months, lastMonth];
  }


  let getMonthDiff2 = (from, to)=> {
    from = new Date(from);
    to = new Date(to);
    let valid = !isNaN(from) && !isNaN(to) && from < to ;
    if(! valid) return [];
    let months = 0;
    let firstMonth = 0;
    let lastMonth = 0;
    months = (to.getFullYear() - from.getFullYear()) * 12;
    months -= from.getMonth() + 1;
    months += to.getMonth();
    months = months <= 0 ? 0 : months;

    firstMonth = from.getDate() <= 15 ? 1 :0.5;
    lastMonth = to.getDate() >= 15 ? 1 :0.5;
    return [firstMonth, months, lastMonth];
  }

  let transactions = [
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 500, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 700, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 500, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 700, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 500, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 700, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' }
  ];
});
