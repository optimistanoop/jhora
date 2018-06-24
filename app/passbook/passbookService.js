
jhora.service('passbookService', function($mdDateLocale) {
  
  let caluclateSI = (p =0, r=0, t=0)=>{ return p*r*t/100; };
  let updateFinalTran = (finalTran, p=0, si=0) => {
    finalTran.p = p;
    finalTran.si = si;
    finalTran.amount = p;
    finalTran.total = p + si;
  };
  
  let calculateNewPSI = (p =0, si=0, i=0, finalTran)=>{ 
    let newPSI = {};
    if(i <= si){
      newPSI.si =  si - i;
      newPSI.p =  p;
      newPSI.type =  finalTran.type;
    }else if(i > si){
      newPSI.si =  0;
      newPSI.p =  (p + si) - i;
      newPSI.type = newPSI.p > 0 ? finalTran.type : finalTran.type == 'Cr' ? 'Dr':'Cr';
      newPSI.p =  Math.abs(newPSI.p);
    }
    return newPSI;
  };

  let calcOnlyForYrs = (from, to, trans = [], finalTran)=>{
    let fromPlus1Yr = new Date(from.getFullYear()+1, from.getMonth(), from.getDate());
    if(to <= fromPlus1Yr) return null;
    
    let p = trans[0].amount, si = trans[0].si ? trans[0].si : 0,
    type = finalTran.type,
    mergedType = 'Yr',
    rate = trans[0].rate,
    yrDiff = to.getFullYear() - from.getFullYear(),
    calcYrs  = [];
    for(let i = 0; i< yrDiff; i++){
      if(from.getMonth() == 0 && from.getDate() <= 15){
        fromPlus1Yr = new Date(from.getFullYear(), 11 , 31);
      }else{
        let d = from.getDate() > 15 ? 15 : 28;
        let m = d > 15 ? from.getMonth() -1 : from.getMonth();
        fromPlus1Yr = new Date(from.getFullYear()+1, m, d);
      }
      calcYrs.push(fromPlus1Yr);
      from = fromPlus1Yr;
    }
    
    let frstCalcYr = calcYrs[0],
    toDate = calcYrs[calcYrs.length - 1];
    for(let i = 0; i < trans.length; i++){
      let tran = trans[0],
      times = getMonthDiff(tran.date, frstCalcYr),
      diffFromFrstCalcYr = times.reduce((accumulator, currentValue)=>{ return accumulator + currentValue; }, 0);    
      if(tran.type == type){
        if(i>0){
          p += tran.amount;
          si += tran.si ? tran.si :0;
        }
        si += caluclateSI(tran.amount, tran.rate, diffFromFrstCalcYr);
      }else {
        let newPSI = calculateNewPSI(p, si, tran.amount, finalTran);
        p = newPSI.p;
        si = newPSI.si;
        type = newPSI.type;
      }
      updateFinalTran(finalTran, p, si);                   
    }
    
    p = p + si;
    si = 0;
    
    for(let i = 1; i <  calcYrs.length; i++){
      si = caluclateSI(p, trans[0].rate, 12);
      p = p + si;
      si = 0;
    }
    p = Math.round(p);
    si =  Math.round(si);
    let amount = p,
    total = p + si;
    let d = toDate.getDate() > 15 ? 1 : 16;
    let m = d > 15 ? toDate.getMonth() : toDate.getMonth() + 1;
    let balPassedTo = new Date(toDate.getFullYear(), m, d);
    let calcTill = new Date(toDate.getFullYear(), toDate.getDate() <= 15 ? toDate.getMonth(): toDate.getMonth() + 1, toDate.getDate() <= 15 ?  15 : 0);
    return {amount, total , si, type, date : balPassedTo, calcOn : toDate, calcTill, rate, mergedType}
  };
  
  let calcOnlyForMonths = (from, to, trans=[], finalTran, mergedType)=>{
    let si =  trans[0].si ? trans[0].si : 0,
    p = trans[0].amount,
    rate = trans[0].rate,
    type = finalTran.type;
    
    for(let i = 0; i < trans.length; i++){
      let tran = trans[i],
      times = getMonthDiff(tran.date, to),
      months = times.reduce((accumulator, currentValue)=>{ return accumulator + currentValue; }, 0);
      if(tran.type == type){
        if(i>0){
          p += tran.amount;
          si += tran.si ? tran.si :0;
        }
        si += caluclateSI(tran.amount, tran.rate, months);
      }else {
        let newPSI = calculateNewPSI(p, si, tran.amount, finalTran);
        p = newPSI.p;
        si = newPSI.si;
        type = newPSI.type;
      }
      updateFinalTran(finalTran, p, si);
    }
    p = Math.round(p);
    si =  Math.round(si);
    let total = p + si,    
    amount = p;
    let d = to.getDate() > 15 ? 1 : 16;
    let m = d > 15 ? to.getMonth() : to.getMonth() + 1;
    let balPassedTo = new Date(to.getFullYear(), m, d);    
    let calcTill = new Date(to.getFullYear(), to.getDate() <= 15 ? to.getMonth(): to.getMonth() + 1, to.getDate() <= 15 ?  15 : 0);    
    return {amount, p, si, total, type, rate , mergedType, date : balPassedTo, calcOn: to, calcTill};
  };

  let calcLatest = (trans = [], calcDate)=>{
    let results = [[trans[0]]],
    calcResults = [],
    fromTran = trans[0],
    finalTran = {type : trans[0].type};
    for(let i=0; i<trans.length + 1; i++){
      if(i>0 &&  i < trans.length){
        let t = trans[i],
        from = fromTran.date,
        to = t.date,
        // calcOnlyForYrs to calc for last index arr of results
        // calcOnlyForYrs should also give the type as mergedTran due to yr
        // calcOnlyForYrs will create new P with I = 0
        mergedTran = calcOnlyForYrs(from, to , results[results.length -1], finalTran);
        fromTran = mergedTran ? mergedTran : fromTran;
        if(mergedTran){
          finalTran = {p: mergedTran.amount, si: mergedTran.si, total : mergedTran.total, type: mergedTran.type};
          results.push([mergedTran]);
          calcResults.push(mergedTran);
        }else{
          if(i > 1){
            let nResults = Array.from(results[results.length -1]);
            nResults.push(trans[i-1]);
            results.push(nResults);
          }
        }
        
        // merge trans after calc if P, I is changing due to tran type
        // here the rule will be to calc till date of tran and deduce amount from I first than P
        // calc new P and I
        if(fromTran.type != t.type){
          let from = fromTran.date,
          to = t.date;
          // calcForAllTrans should also give the type as mergedTran due to tranType and cr/dr
          // calcForAllTrans will create new P and I
          // calcForAllTrans, the rule will be to calc till date of tran and deduce amount from I first than P
          mergedTran = calcOnlyForMonths(from, to, results[results.length -1], finalTran, 'Tr');
          fromTran = mergedTran ? mergedTran : fromTran;

          if(mergedTran){
            finalTran = {p: mergedTran.amount, si: mergedTran.si, total : mergedTran.total, type: mergedTran.type};
            results.push([mergedTran]);
            calcResults.push(mergedTran);
          }
        }
        
      } else if(i ==  trans.length){
        let from = fromTran.date,
        to = calcDate,
        // calcOnlyForYrs to calc for last index arr of results
        // calcOnlyForYrs should also give the type as merge due to yr and cr/dr
        mergedTran = calcOnlyForYrs(from, to , results[results.length -1], finalTran);
        fromTran = mergedTran ? mergedTran : fromTran;

        if(mergedTran){
          finalTran = {p: mergedTran.amount, si: mergedTran.si, total : mergedTran.total, type: mergedTran.type};
          results.push([mergedTran]);
          calcResults.push(mergedTran);
        }else{
          if(i > 1){
            let nResults = Array.from(results[results.length -1]);
            nResults.push(trans[i-1]);
            results.push(nResults);
          }
        }
        
        // calc for diff of yrs month and calc date
        from = fromTran.date;
        // calcOnlyForMonths to calc for last index arr of results
        // calcOnlyForMonths should take diff of every tranDate from fromDate and calc P, I independently
        // calcOnlyForMonths should accumulate P, I 
        // calcOnlyForMonths should also give the type as final and cr/dr
        finalTran = calcOnlyForMonths(from, to, results[results.length -1], finalTran, 'Fn');
        finalTran ?  results.push([finalTran]) :[];
        finalTran ?  calcResults.push(finalTran) :[];
        console.log('anp results last', results);
        console.log('anp calcResults', calcResults);
        console.log('anp finalTran', finalTran);
      }
    }
    
    return {finalTran, calcResults,  results};
  }

  let getMonthDiff = (from, to)=>{
    from = new Date(from);
    to = new Date(to);
    let valid = !isNaN(from) && !isNaN(to) && from <= to ;
    if(! valid) return [];
    let months = 0,
    firstMonth = 0,
    lastMonth = 0;
    months = (to.getFullYear() - from.getFullYear()) * 12;
    months -= from.getMonth() + 1;
    months += to.getMonth();
    months = months <= 0 ? 0 : months;

    firstMonth = from.getDate() > 15 ? 0.5 : 1;
    lastMonth = to.getDate() > 15 ? 1 : 0.5;

    if(to.getFullYear() == from.getFullYear() && to.getMonth() == from.getMonth()){
      if((from.getDate() > 15 && to.getDate() > 15) || (from.getDate() <= 15 && to.getDate() <= 15)){
        firstMonth = 0.5;
        lastMonth = 0;
      }else if(from.getDate() <= 15 && to.getDate() > 15){
        firstMonth = 1;
        lastMonth = 0;
      }
    }
    
    return [firstMonth, months, lastMonth];
  }
  
  return {caluclateSI, calcOnlyForMonths, calcLatest};
});


// let caluclateSI = (p, r, t)=>{
//   return p*r*t/100;
// };
// 
// let getCalcDates = ()=>{
//   //TODO  rotate over transactions and return the calc dates
//   //TODO here the consideration should be either Cr/Dr based on first type or 1 yr of the transaction
//   let result = [];
//   //let crPrinciple = 0;
//   let principle = 0;
//   //let drPrinciple = 0;
//   //let crInterest = 0;
//   //let drInterest = 0;
//   let interest = 0;
//   let netAmt = principle + interest; 
//   //let netAmt = drPrinciple + drInterest - (crPrinciple + crInterest ); 
//   //let netTyp = netAmt >= 0 ? 'Dr' : 'Cr';
//   let netTyp = $scope.transaction[0].type;
//   let tranDate = $scope.transaction[0].date;
//   //let  firstTranDate= new Date($scope.transaction[0].date);
//   let nextYrMergerDate = new Date(firstTranDate.getFullYear()+1, firstTranDate.getMonth(), firstTranDate.getDate());
//   for(let i = 0; i < $scope.transactions.length; i++){
//     let tran = $scope.transactions[i];
//     if(tran.date > nextYrMergerDate){
//       // TODO calc based on the total calc amount till date
//       // TODO filter trans from tranDate to nextYrMergerDate inclucive
//       // TODO cal int for all till nextYrMergerDate
//       // TODO merge p and I (isolated)
//       // TODO merge p and I (together for netAmt)
//       //TODO netTyp to changes based on the total calc
// 
//       //netAmt = drPrinciple + drInterest - (crPrinciple + crInterest );
//       netTyp = netAmt >= 0 ? 'Dr' : 'Cr';
//       tranDate = nextYrMergerDate;
//       nextYrMergerDate = new Date(tranDate.getFullYear()+1, tranDate.getMonth(), tranDate.getDate());
//     }
//     if(tran.type != netTyp || ( i > 0 && (i == ($scope.transactions.length -1 )))){
// 
//       tranDate = tran.date;
//       nextYrMergerDate = new Date(tranDate.getFullYear()+1, tranDate.getMonth(), tranDate.getDate());
//       //TODO netTyp to changes based on the total calc
//     }
// 
//     // TODO for first or last tran which is older than 1 yr on calc day
//   }
// 
//   return '';
// };
// 
// let calc = ()=>{
//   let p =0, i = 0;;
//   let netType = trans[0].type;
//   let lastCalcDate = trans[0].date;
//   let lastCalcIndex = 0;
// 
//   for (let i = 0; i < trans.length; i++){
//     let tran = trans[i];
//     if(trna.type !=  netType){
//        // calc and set p, i, netType, netAmt, lastCalcDate
//        for(let j = lastCalcIndex; j < i; j++){
//          let nTran = trans[j];
// 
//          calcYr(lastCalcDate, tran, trans[j])
//        }
// 
//        let startDate = trans[lastCalcIndex].date;
//        let endDate = trans[i].date;
// 
//     }
//     else if(i > 0 &&  i == trans.length -1){
//        // calc and set p, i, netType,
//     }
//   }
// 
//   // for last tran
//   // get all yrs calc date from last cal date to  actual calc date including last yr month diff
//   // loop over all yrs calc date 
//   // calc and for the year
//   // set p, i, netType, lastCalcDate
//   // in the last loop calc for months
//   // set p, i, netType, lastCalcDate
// 
// }
// 
// let calcOnlyForYrs = (from, to, trans)=>{
// 
// };
// let calcForAllTrans = (from, to, trans)=>{
// };
// 
// let calcOnlyForMonths = (from, to, trans)=>{
//   let si = 0;
//   for(let tran of trans){
//     let times = getMonthDiff(tran.date, to);
//     console.log('anp times', times);
//     let months = times.reduce((accumulator, currentValue)=>{
//           return accumulator + currentValue;
//         }, 0);
//     si += caluclateSI(tran.amount, tran.rate, months);
//   }
// 
//   let amount = trans.reduce((accumulator, currentValue)=>{
//         return accumulator + currentValue.amount;
//       }, 0);
// 
//   return {amount: amount, si:si, date: to};
// };
// 
// let calcLatest = ()=>{
//   let trans = $scope.transactions;
//   let results = [[trans[0]]];
//   let fromTran = trans[0];
//   let calcDate = $scope.calcDate;
//   for(let i=0; i<trans.length + 1; i++){
//     if(i>0 &&  i < trans.length){
//       let t = trans[i];
//       let from = fromTran.date;
//       let to = t.date;
//       // calcOnlyForYrs to calc for last index arr of results
//       // calcOnlyForYrs should also give the type as mergedTran due to yr
//       // calcOnlyForYrs will create new P with I = 0
//       let mergedTran = calcOnlyForYrs(from, to , results[results.length -1]);
//       fromTran = mergedTran ? mergedTran : fromTran;
//       if(mergedTran){
//         results.push([mergedTran]);
//       }else{
//         if(i > 1){
//           let nResults = results[results.length -1];
//           nResults.push(trans[i-1]);
//           results.push(nResults);
//         }
// 
//       }
// 
//       // merge trans after calc if P, I is changing due to tran type
//       // here the rule will be to calc till date of tran and deduce amount from I first than P
//       // calc new P and I
//       if(fromTran.type != t.type){
//         let from = fromTran.date;
//         let to = t.date;
//         // calcForAllTrans should also give the type as mergedTran due to tranType and cr/dr
//         // calcForAllTrans will create new P and I
//         // calcForAllTrans, the rule will be to calc till date of tran and deduce amount from I first than P
//         mergedTran = calcForAllTrans(from, to, results[results.length -1]);
//         if(mergedTran){
//           fromTran = mergedTran;
//           results.push([mergedTran]);
//         }
//       }
// 
//       console.log('anp i', i);
//       console.log('anp results i', results);
// 
//     } else if(i ==  trans.length){
//       let from = fromTran.date;
//       let to = calcDate;
//       // calcOnlyForYrs to calc for last index arr of results
//       // calcOnlyForYrs should also give the type as merge due to yr and cr/dr
//       let mergedTran = calcOnlyForYrs(from, to , results[results.length -1]);
//       fromTran = mergedTran ? mergedTran : fromTran;
//       if(mergedTran){
//         results.push([mergedTran]);
//       }else{
//         if(i > 1){
//           let nResults = results[results.length -1];
//           nResults.push(trans[i-1]);
//           results.push(nResults);
//         }
//       }
// 
//       // calc for diff of yrs month and calc date
//       from = fromTran.date;
//       // calcOnlyForMonths to calc for last index arr of results
//       // calcOnlyForMonths should take diff of every tranDate from fromDate and calc P, I independently
//       // calcOnlyForMonths should accumulate P, I 
//       // calcOnlyForMonths should also give the type as final and cr/dr
//       console.log('anp from ', from);
//       console.log('anp to ', to);
//       console.log('anp calc results ', results[results.length -1]);
//       let finalTran = calcOnlyForMonths(from, to, results[results.length -1])
//       finalTran ?  results.push([finalTran]) :[];
//       console.log('anp last i', i);
//       console.log('anp results last i', results);
//       console.log('anp finalTran', finalTran);
//     }
//   }
// }
// 
// let getMonthDiff = (from, to)=>{
// 
//   from = new Date(from);
//   to = new Date(to);
//   let valid = !isNaN(from) && !isNaN(to) && from <= to ;
//   if(! valid) return [];
//   let months = 0;
//   let firstMonth = 0;
//   let lastMonth = 0;
//   months = (to.getFullYear() - from.getFullYear()) * 12;
//   months -= from.getMonth() + 1;
//   months += to.getMonth();
//   months = months <= 0 ? 0 : months;
// 
//   firstMonth = from.getDate() > 15 ? 0.5 : 1;
//   lastMonth = to.getDate() > 15 ? 1 : 0.5;
// 
//   if(to.getFullYear() == from.getFullYear() && to.getMonth() == from.getMonth()){
//     if((from.getDate() > 15 && to.getDate() > 15) || (from.getDate() <= 15 && to.getDate() <= 15)){
//       firstMonth = 0.5;
//       lastMonth = 0;
//     }else if(from.getDate() <= 15 && to.getDate() > 15){
//       firstMonth = 1;
//       lastMonth = 0;
//     }
//   }
// 
//   return [firstMonth, months, lastMonth];
// }
