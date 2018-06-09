
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, $routeParams,$window,$mdDialog,$mdToast, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

  const {dialog} = require('electron').remote;
  const {shell} = require('electron');
  $scope.custid=$routeParams.id;
  $scope.customer = {};
  $scope.init = ()=> {
    q.selectAllById('customers', 'id', $scope.custid)
    .then((rows)=>{
      $timeout(()=> {
      $scope.customer = rows[0];
  $scope.hideNoDataFound = true;
  $scope.salutation = '';
      if($scope.customer.salutation == 'Mrs'){
          $scope.salutation = 'W/o' ;
      }else if($scope.customer.salutation == 'Mr'){
          $scope.salutation = 'S/o' ;
      }else{
          $scope.salutation = 'D/o' ;
        }
 $scope.sortBy = (propertyName)=>{
   $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
   $scope.propertyName = propertyName;
 };

 $scope.deleteTransaction=(ev,transaction)=>{
   shell.beep()
   $mdDialog.show({
   controller: ($scope, $mdDialog)=>{
   $scope.message = 'Are you sure to delete...?'
   $scope.transaction = transaction;
   $scope.answer = function(answer) {
   $mdDialog.hide(answer);
  };
},
  templateUrl: 'transaction/previewTransaction.html',
  parent: angular.element(document.body),
  targetEvent: ev,
  clickOutsideToClose:false,
  fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
})
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
           $mdToast.show(
           $mdToast.simple()
           .textContent(`${transaction.name}'s Transaction Deleted.`)
           .position('bottom right')
           .hideDelay(3000)
           );
         })
         .catch((err)=>{
           console.error('anp an err occured while deleting',err);
         });
       }
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

       
 $scope.getCustomerPassbook = (tableName)=>{
      q.selectAllById(tableName, 'customerId', $scope.custid)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
          row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
        }
        $timeout(()=>{
          $scope.transactions = rows;
          if(tableName == TRANSACTION_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        },0);
      })
      .catch((err)=>{
        console.error(err);
      });
  };

  $scope.getCustomerPassbook(TRANSACTION_TABLE);
  $scope.Back = ()=>{
    $window.history.back();
  }
  let getMonthDiff2 = (from, to)=>{

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


  function getMonthDiff (from, to) {
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
},0)
})
};
$scope.init();
  let transactions = [
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 500, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 700, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Dr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' },
    { amount: 100, date: '2018-01-01', promiseDate: '2018-11-11', type: 'Cr', customerId: '1', name: 'Anoop', village:'Daniyari', remarks: '' }
  ];


  });
