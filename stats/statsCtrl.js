jhora.controller('statsCtrl', function($rootScope, $scope, $timeout, TRANSACTION_TABLE, CUSTOMERS_TABLE, VILLAGE_TABLE){

  $scope.stats = {};

  $scope.stats.countCustomer = (customer)=>{
    q.getTotalCountForTable(customer)
    .then((data)=>{
      $timeout(()=>{
        $scope.stats.totalCustomer = data["count(id)"]
      },0);
    })
  }

  $scope.stats.countVillage = (village)=>{
    q.getTotalCountForTable(village)
    .then((data)=>{
      $timeout(()=>{
        $scope.stats.totalVillages = data["count(id)"]
      },0);
    })
  }

  $scope.stats.countTransactionBetweenDates = (transactions)=>{
    let dd = new Date(new Date().getFullYear(), new Date().getMonth()+1,  0),
    y = dd.getFullYear(),
    // months index start with 0
    m = dd.getMonth() < 9 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1,
    // getting last day of the month
    lastDateOfMonth = dd.getDate() < 10 ? '0' + (dd.getDate()) : dd.getDate(),
    from  = `${y}-${m}-01`,
    to = `${y}-${m}-${lastDateOfMonth}`;
    $scope.stats.to = to;
    $scope.stats.from = from;
    q.selectDataByDatesWithoutCondition(transactions, 'date',from, to)
    .then((data)=>{
      $timeout(()=>{
        $scope.stats.transactionWithindates = data[0]['count(id)']
      }, 0);
    })
  }

  $scope.stats.transactionAverageDr = (transactions)=>{
    q.countTransactionByType('amount',transactions,'type', 'Dr')
    .then((data)=>{
      let count = data.length,
      total = 0;
      for (let i = 0; i < count; i++) {
        total += data[i]['amount']
        console.log(total);
      }
      let avg = total/count;
      $scope.stats.avgDr = count ? avg : 0;
    })
  }

  $scope.stats.transactionAverageCr = (transactions)=>{
    q.countTransactionByType('amount',transactions,'type', 'Cr')
    .then((data)=>{
      let count = data.length,
      total = 0;
      for (let i = 0; i < count; i++) {
        total += data[i]['amount']
      }
      let avg = total/count;
      $scope.stats.avgCr = count ? avg : 0;

    })
  }

  $scope.stats.transactionAverageDr(TRANSACTION_TABLE);
  $scope.stats.transactionAverageCr(TRANSACTION_TABLE);
  $scope.stats.countTransactionBetweenDates(TRANSACTION_TABLE);
  $scope.stats.countVillage(VILLAGE_TABLE);
  $scope.stats.countCustomer(CUSTOMERS_TABLE);

});
