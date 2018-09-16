jhora.controller('statsCtrl', function($rootScope, $scope, $timeout){
  $scope.countCustomer = (customer)=>{
    q.getTotalCountForTable(customer)
    .then((data)=>{
      $timeout(()=>{
          $scope.totalCustomer = data["count(id)"]
        },0);
      })
    }

  $scope.countVillage = (village)=>{
    q.getTotalCountForTable(village)
    .then((data)=>{
      $timeout(()=>{
          $scope.totalVillages = data["count(id)"]
        },0);
      })
    }


  $scope.countTransactionBetweenDates = (transactions)=>{
    let dd = new Date(new Date().getFullYear(), new Date().getMonth()+1,  0),
     y = dd.getFullYear(),
     // months index start with 0
     m = dd.getMonth() < 9 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1,
// getting last day of the month
     lastDateOfMonth = dd.getDate() < 10 ? '0' + (dd.getDate()) : dd.getDate(),
     from  = `${y}-${m}-01`,
     to = `${y}-${m}-${lastDateOfMonth}`,
     fn = (data)=>{
       let tfn = ()=>{
          $scope.transactionWithindates = data[0]['count(id)']
       };
      $timeout(tfn, 0);
    };
    $scope.to = to;
    $scope.from = from;
    q.selectDataByDatesWithoutCondition(transactions, 'date',from, to)
    .then(fn)
  }

  $scope.countTransactionBetweenDates('transactions')
  $scope.countVillage('village')
  $scope.countCustomer('customers')

});
