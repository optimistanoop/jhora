
jhora.controller('viewPassbookCtrl', function($rootScope, $scope, $timeout, $routeParams, $location, TRANSACTION_TYPES, VIEW_LIMITS, CUSTOMERS_TABLE, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {
  $scope.custid=$routeParams.id;
  $scope.customer ={};
  $scope.init = ()=> {
    q.selectAllById('customers', 'id', $scope.custid)
    .then((rows)=>{
      $timeout(()=> {
      console.log('logging rows',rows[0]);
      $scope.customer = rows[0];
      console.log('inside logging Customer',$scope.customer);
    },0)
  })
  };
  $scope.init();
  $scope.hideNoDataFound = true;
  $scope.salutation = '';
      if($scope.customer.salutation == 'Mrs'){
          $scope.salutation = 'W/o' ;
      }else if($scope.customer.salutation == 'Mr'){
          $scope.salutation = 'S/o' ;
      }else{
          $scope.salutation = 'D/o' ;
        }
console.log('outside logging customer',$scope.customer);
$scope.sortBy = function(propertyName) {
   $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
   $scope.propertyName = propertyName;
 };

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
        let  {amount, date, promiseDate, type, customerId, name, village, remarks } = transaction;
        let keys = ['amount', 'date', 'promiseDate', 'type', 'customerId', 'name', 'village', 'remarks' ];
        let values =[amount, date, promiseDate, type, customerId, name, village, remarks];
         q.insert(DELTRANSACTION_TABLE, keys, values)
         .then((data)=>{
           return q.deleteRowById(TRANSACTION_TABLE, transaction.id);
         })
         .then((data)=>{
           $scope.getCustomerPassbook(TRANSACTION_TABLE);
           dialog.showMessageBox({type :'info', message:`${transaction.name}'s transaction deleted`, buttons:[]});
         })
         .catch((err)=>{
           console.error('anp an err occured while deleting', transaction);
         });
       }
   })
 };

 $scope.getCustomerPassbook = (tableName)=>{
      q.selectAllById(tableName, 'customerId', $scope.customer.id)
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
    $rootScope.template = {title: 'Customers', content:'customer/viewCustomer.html'}
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
