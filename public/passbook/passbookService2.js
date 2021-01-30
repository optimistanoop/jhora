
jhora.service('passbookService', function($mdDateLocale) {
  
  let calculateSI = (p =0, r=0, t=0)=>{ return p*r*t/100; };
  let addCalcResults = (p, si, type, date, rate, mergedType , calcResults)=>{
    p = Math.round(p);
    si = Math.round(si);
    let d = date.getDate() > 15 ? 1 : 16,
    m = d > 15 ? date.getMonth() : date.getMonth() + 1,
    balPassedTo = new Date(date.getFullYear(), m, d),
    calcTill = new Date(date.getFullYear(), date.getDate() <= 15 ? date.getMonth(): date.getMonth() + 1, date.getDate() <= 15 ?  15 : 0);
    calcResults.push({amount : p, total : p+ si, si, type, date : balPassedTo, calcOn : date, calcTill:calcTill, rate, mergedType})
    return {balPassedTo, calcTill, calcResults};
  };
  
  let getFromPlus1Yr = (from)=>{
    let fromPlus1Yr;
    if(from.getMonth() == 0 && from.getDate() <= 15){
      fromPlus1Yr = new Date(from.getFullYear(), 11 , 31);
    }else{
      let d = from.getDate() > 15 ? 15 : 0;
      fromPlus1Yr = new Date(from.getFullYear()+1, from.getMonth(), d);
    }
    return fromPlus1Yr
  };
  
  let updateFinalTran = (finalTran, p=0, si=0) => {
    finalTran.p = p;
    finalTran.si = si;
    finalTran.amount = p;
    finalTran.total = p + si;
    return finalTran;
  };
  
  let calculatePSI = (trans=[], to, p =0, si=0, type, finalTran, calcResults, mergedType) => {
    
    for(let i = 0; i < trans.length; i++){
      let tran = trans[i],
      months = getMonthDiff(tran.date, to);
      if(tran.type == type){
        if(i>0){
          p += tran.amount;
          si += tran.si ? tran.si :0;
        }
        si += calculateSI(tran.amount, tran.rate, months);
      }else {
        let newPSI = calculateUpdatedPSI(p, si, tran.amount, finalTran);
        p = newPSI.p;
        si = newPSI.si;
        type = newPSI.type;
      }
      finalTran = updateFinalTran(finalTran, p, si);
      
      addCalcResults(p, si, type, to, tran.rate, mergedType , calcResults);
    }
     
    return {p, si, type, finalTran};
  };
  
  let calculateUpdatedPSI = (p =0, si=0, i=0, finalTran)=>{ 
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

  let calculatePSIForYears = (from, to, trans = [], finalTran, calcResults)=>{
    let fromPlus1Yr = getFromPlus1Yr(from);
    if(to <= fromPlus1Yr) return null;
    
    let p = trans[0].amount, si = trans[0].si ? trans[0].si : 0,
    type = finalTran.type,
    mergedType = 'Yearly',
    rate = trans[0].rate,
    months = getMonthDiff(from , to);
    yrDiff =  Math.floor(months / 12);
    calcYrs  = [];
    for(let i = 0; i< yrDiff; i++){
      fromPlus1Yr = getFromPlus1Yr(from);
      calcYrs.push(fromPlus1Yr);
      from = fromPlus1Yr;
    }
    
    let frstCalcYr = calcYrs[0],
    toDate = calcYrs[calcYrs.length - 1];
    let psi = calculatePSI(trans, frstCalcYr, p, si, type, finalTran, calcResults, mergedType);
    p = psi.p + psi.si;
    si = 0;
    type = psi.type;
    finalTran = psi.finalTran;
    addCalcResults(p, si, type, frstCalcYr, trans[0].rate, mergedType , calcResults);
    
    for(let i = 1; i <  calcYrs.length; i++){
      si = calculateSI(p, trans[0].rate, 12, calcResults);
      p = p + si;
      si = 0;
      addCalcResults(p, si, type, calcYrs[i], trans[0].rate, mergedType , calcResults);
    }
    let amount = p,
    total = p + si,
    {balPassedTo, calcTill} = addCalcResults(p, si, type, calcYrs[calcYrs.length -1], trans[0].rate, mergedType , []);
    return {amount, total , si, type, date : balPassedTo, calcOn : toDate, calcTill, rate, mergedType}
  };
  
  let calculatePSIForMonths = (from, to, trans=[], finalTran, mergedType, calcResults)=>{
    let si =  trans[0].si ? trans[0].si : 0,
    p = trans[0].amount,
    rate = trans[0].rate,
    type = finalTran.type,
    psi = calculatePSI(trans, to, p, si, type, finalTran, calcResults, mergedType);
    type = psi.type;
    finalTran = psi.finalTran;
    p = psi.p;
    si =  psi.si;
    let total = p + si,    
    amount = p;
    d = to.getDate() > 15 ? 1 : 16,
    m = d > 15 ? to.getMonth() : to.getMonth() + 1,
    balPassedTo = new Date(to.getFullYear(), m, d),    
    calcTill = new Date(to.getFullYear(), to.getDate() <= 15 ? to.getMonth(): to.getMonth() + 1, to.getDate() <= 15 ?  15 : 0);    
    return {amount, p, si, total, type, rate , mergedType, date : balPassedTo, calcOn: to, calcTill};
  };

  let handleMonthlyCalc = (from, to, results, calcResults, finalTran, fromTran, mergedType)=>{
    let mergedTran = calculatePSIForMonths(from, to, results[results.length -1], finalTran, mergedType, calcResults);
    if(mergedTran){
      fromTran = mergedTran;
      finalTran = {p: mergedTran.amount, si: mergedTran.si, total : mergedTran.total, type: mergedTran.type};
      results.push([mergedTran]);
      //calcResults.push(mergedTran);
    }
    return {results, calcResults, finalTran, fromTran};
  };
  let handleYearlyCalc = (from, to, trans=[], results, calcResults, finalTran, fromTran, i)=>{
    let mergedTran = calculatePSIForYears(from, to , results[results.length -1], finalTran, calcResults);
    if(mergedTran){
      fromTran = mergedTran;
      finalTran = {p: mergedTran.amount, si: mergedTran.si, total : mergedTran.total, type: mergedTran.type};
      results.push([mergedTran]);
      //calcResults.push(mergedTran);
    }else{
      if(i > 1){
        let nResults = Array.from(results[results.length -1]);
        i != trans.length ? nResults.push(trans[i]) :[];
        results.push(nResults);
      }
    }
    return {results, calcResults, finalTran, fromTran};
  };
  
  let calculateFinalPSI = (trans = [], calcDate)=>{
    let p =new Promise( (resolve, reject)=>{
      let firstTran = trans[0] ? trans[0] : {};
      let  config = { results : [[firstTran]], calcResults : [], fromTran : firstTran, finalTran : {type : firstTran ? firstTran.type :''}};
      for(let i=0; i< trans.length + 1; i++){
        if(i>0 &&  i < trans.length){
          let t = trans[i],
          from = config.fromTran.date,
          to = t.date;
          // merge trans after calc if P, I is changing due to tran type
          // here the rule will be to calc till date of tran and deduce amount from I first than P
          // calc new P and I
          config = handleYearlyCalc(from, to, trans, config.results, config.calcResults, config.finalTran, config.fromTran, i);
          
          if(config.fromTran.type != t.type){
            let from = config.fromTran.date,
            to = t.date;
            // calcForAllTrans should also give the type as mergedTran due to tranType and cr/dr
            // calcForAllTrans will create new P and I
            // calcForAllTrans, the rule will be to calc till date of tran and deduce amount from I first than P
            let nResults = Array.from(config.results[config.results.length -1]);
            nResults.push(t);
            config.results.push(nResults);
            config = handleMonthlyCalc(from, to, config.results, config.calcResults, config.finalTran, config.fromTran, 'Transactional');
          }
          
        } else if(i > 0 && i ==  trans.length){
          let from = config.fromTran.date,
          to = calcDate;
          // calcOnlyForYrs to calc for last index arr of results
          // calcOnlyForYrs should also give the type as merge due to yr and cr/dr
          config = handleYearlyCalc(from, to, trans, config.results, config.calcResults, config.finalTran, config.fromTran, i);
          
          // calc for diff of yrs month and calc date
          from = config.fromTran.date;
          // calcOnlyForMonths to calc for last index arr of results
          // calcOnlyForMonths should take diff of every tranDate from fromDate and calc P, I independently
          // calcOnlyForMonths should accumulate P, I 
          // calcOnlyForMonths should also give the type as final and cr/dr
          config = handleMonthlyCalc(from, to, config.results, config.calcResults, config.finalTran, config.fromTran, 'Final');          
        }
      }
      resolve(config);
    });
    return p; 
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
    let totalMonths = firstMonth + months + lastMonth;
    return totalMonths;
  }
  
  return {calculateFinalPSI, calculatePSIForYears, calculatePSIForMonths, calculateSI};
});
