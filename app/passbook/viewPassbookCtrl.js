
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, $routeParams,$window, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

  const {dialog} = require('electron').remote;
  const {shell} = require('electron');
  $rootScope.template = {title: 'Passbook'};
  $scope.custid=$routeParams.id;
  $scope.customer = {};
  $scope.init = ()=> {
    q.selectAllById('customers', 'id', $scope.custid)
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
  $scope.sortBy = (propertyName)=>{
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

 $scope.deleteTransaction=(ev,transaction)=>{
  shell.beep();
  $rootScope.showDialog(ev,'transaction', transaction, 'transaction/previewTransaction.html','Are you sure to delete...?')
    .then((answer)=>{
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
           $rootScope.showToast(`${transaction.name}'s Transaction Deleted.`);
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

  $scope.init();
  $scope.getCustomerPassbook(TRANSACTION_TABLE);
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
