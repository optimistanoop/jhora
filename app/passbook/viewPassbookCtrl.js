
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
    //let crPrinciple = 0;
    let principle = 0;
    //let drPrinciple = 0;
    //let crInterest = 0;
    //let drInterest = 0;
    let interest = 0;
    let netAmt = principle + interest; 
    //let netAmt = drPrinciple + drInterest - (crPrinciple + crInterest ); 
    //let netTyp = netAmt >= 0 ? 'Dr' : 'Cr';
    let netTyp = $scope.transaction[0].type;
    let tranDate = $scope.transaction[0].date;
    //let  firstTranDate= new Date($scope.transaction[0].date);
    let nextYrMergerDate = new Date(firstTranDate.getFullYear()+1, firstTranDate.getMonth(), firstTranDate.getDate());
    for(let i = 0; i < $scope.transactions.length; i++){
      let tran = $scope.transactions[i];
      if(tran.date > nextYrMergerDate){
        // TODO calc based on the total calc amount till date
        // TODO filter trans from tranDate to nextYrMergerDate inclucive
        // TODO cal int for all till nextYrMergerDate
        // TODO merge p and I (isolated)
        // TODO merge p and I (together for netAmt)
        //TODO netTyp to changes based on the total calc
        
        //netAmt = drPrinciple + drInterest - (crPrinciple + crInterest );
        netTyp = netAmt >= 0 ? 'Dr' : 'Cr';
        tranDate = nextYrMergerDate;
        nextYrMergerDate = new Date(tranDate.getFullYear()+1, tranDate.getMonth(), tranDate.getDate());
      }
      if(tran.type != netTyp || ( i > 0 && (i == ($scope.transactions.length -1 )))){
        
        tranDate = tran.date;
        nextYrMergerDate = new Date(tranDate.getFullYear()+1, tranDate.getMonth(), tranDate.getDate());
        //TODO netTyp to changes based on the total calc
      }
      
      // TODO for first or last tran which is older than 1 yr on calc day
    }

    return '';
  };
  
  calc()=>{
  let p =0, i = 0;;
  let netType = trans[0].type;
  let lastCalcDate = trans[0].date;
  let lastCalcIndex = 0;
  
  for (let i = 0; i < trans.length; i++){
    let tran = trans[i];
    if(trna.type !=  netType){
       // calc and set p, i, netType, netAmt, lastCalcDate
       for(let j = lastCalcIndex; j < i; j++){
         let nTran = trans[j];
         
         calcYr(lastCalcDate, tran, trans[j])
       }
       
       let startDate = trans[lastCalcIndex].date;
       let endDate = trans[i].date;
       
    }
    else if(i > 0 &&  i == trans.length -1){
       // calc and set p, i, netType,
    }
  }
  
  // for last tran
  // get all yrs calc date from last cal date to  actual calc date including last yr month diff
  // loop over all yrs calc date 
  // calc and for the year
  // set p, i, netType, lastCalcDate
  // in the last loop calc for months
  // set p, i, netType, lastCalcDate
  
  
}

calcLatest()=>{
  let trans = [];
  let results = [[trans[0]];
  let fromTran = trans[0];
  let calcDate = '';
  for(let i=0; i<trans.length + 1; i++){
    if(i>0 &&  i < trans.length){
      let t = tran[i];
      let from = fromTran.date;
      let to = t.date;
      // calcOnlyForYrs to calc for last index arr of results
      // calcOnlyForYrs should also give the type as merge due to yr
      let mergedTran = calcOnlyForYrs(from, to , results[results.length -1]);
      fromTran = mergedTran ? mergedTran : fromTran;
      if(mergedTran){
        results.push([mergedTran]);
      }else{
        let nResults = results[results.length -1];
        nResults.push(trans[i-1]);
        results.push(nResults);
      }
      
      // merge tran if P, I is changing due to tran type
      // here the rule will be to calc till date of tran and deduce amount from I first than P
      // calc new P and I
      if(fromTran.type != t.type){
        let from = fromTran.date;
        let to = t.date;
        // calcAll should also give the type as merge due to tran type
        mergedTran = calcAll(from, to, results[results.length -1]);
        if(mergedTran){
          results.push([mergedTran]);
        }
      }
      
    } else{
      let from = fromTran.date;
      let to = calcDate;
      // calcOnlyForYrs to calc for last index arr of results
      // calcOnlyForYrs should also give the type as merge due to yr
      let mergedTran = calcOnlyForYrs(from, to , results[results.length -1]);
      fromTran = mergedTran ? mergedTran : fromTran;
      if(mergedTran){
        results.push([mergedTran]);
      }else{
        let nResults = results[results.length -1];
        nResults.push(trans[i-1]);
        results.push(nResults);
      }
      
      // calc for diff of yrs month and calc date
      from = fromTran.date;
      // calcOnlyForMonths to calc for last index arr of results
      let finalTran = calcOnlyForMonths(from, to, results[results.length -1])
      finalTran ?  results.push([finalTran]) :[];
      console.log('anp results', results);
    }
  }
}
 
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
});
