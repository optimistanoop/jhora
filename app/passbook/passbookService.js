
jhora.service('passbookService', function($mdDateLocale) {
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

  let getMonthDiff = (from, to)=>{
    from = new Date(from);
    to = new Date(to);
    let valid = !isNaN(from) && !isNaN(to) && from <= to ;
    if(!valid) return 0;
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

  let calculateSI = (p =0, r=0, t=0)=>{ return p*r*t/100; };

  let getUpdatedPSI = (p =0, si=0, a=0)=>{ 
    let newPSI = {};
    if(a <= si){
      newPSI.si =  si - a;
      newPSI.p =  p;
    }else if(a > si){
      newPSI.si =  0;
      newPSI.p =  (p + si) - a;
      newPSI.p =  Math.abs(newPSI.p);
    }
    return newPSI;
  };

  let calculatePSI = (trans=[], to) => {
    let p = 0, si = 0;
    for(let i = 0; i < trans.length; i++){
      let tran = trans[i],
      months = getMonthDiff(tran.date, to);
      if(tran.type == 'Dr'){
        p += tran.amount;
        si += tran.si ? tran.si :0;
        si += calculateSI(tran.amount, tran.rate, months);
      }else if(tran.type == 'Cr'){
        let newPSI = getUpdatedPSI(p, si, tran.amount);
        p = newPSI.p;
        si = newPSI.si;
      }
    }
    return {p, si};
  };

  let getBalPassedTo = (date)=>{
    let d = date.getDate() > 15 ? 1 : 16,
    m = d > 15 ? date.getMonth() : date.getMonth() + 1,
    balPassedTo = new Date(date.getFullYear(), m, d),
    calcTill = new Date(date.getFullYear(), date.getDate() <= 15 ? date.getMonth(): date.getMonth() + 1, date.getDate() <= 15 ?  15 : 0);
    return {balPassedTo, calcTill};
  };

  let calculatePSIForYears = (from, to, trans = [])=>{

    let p = trans[0].amount, si = trans[0].si ? trans[0].si : 0,
    rate = trans[0].rate,
    months = getMonthDiff(from , to);
    yrDiff =  Math.floor(months / 12);
    calcYrs  = [];
    for(let i = 0; i< yrDiff; i++){
      fromPlus1Yr = getFromPlus1Yr(from);
      calcYrs.push(fromPlus1Yr);
      from = fromPlus1Yr;
    }

    let frstCalcYr = calcYrs[0];
    let psi = calculatePSI(trans, frstCalcYr);
    p = psi.p + psi.si;
    si = 0;

    for(let i = 1; i <  calcYrs.length; i++){
      si = calculateSI(p, trans[0].rate, 12);
      p = p + si;
      si = 0;
    }

    let amount = p,
    total = p + si,
    toDate = calcYrs[calcYrs.length - 1],
    {calcTill, balPassedTo} = getBalPassedTo(toDate);
    return {amount, total , p, si, calcTill, calcOn : toDate, date : balPassedTo}
  };


  let calculatePSIForMonths = (from, to, trans=[])=>{
    let si =  trans[0].si ? trans[0].si : 0,
    p = trans[0].amount,
    rate = trans[0].rate,
    psi = calculatePSI(trans, to);
    p = psi.p;
    si =  psi.si;
    let total = p + si,    
    amount = p,
    {balPassedTo, calcTill} = getBalPassedTo(to);   
    return {amount, total, p, si, calcTill, calcOn: to, date : balPassedTo };
  };

  // this assumes calcDate is valid for all trans
  // first tran is always Dr
  // this is only for debiters hence no +Cr
  let calculateFinalPSI = (trans = [], calcDate)=>{
    let p = new Promise((resolve, reject)=>{  
      let firstTran = trans[0] ? trans[0] : {};
      let  masterObj = {results:[[firstTran]], calcs:[]};

      for(let i = 0; i < trans.length; i++){

        let lastIndexOFResults = masterObj.results.length -1;
        let tran = trans[i];
        let nextTran = trans[i+1];
        let nextTranType = nextTran ? nextTran.type : null;
        let from = masterObj.results[lastIndexOFResults][0].date;
        let to = nextTran ? nextTran.date : calcDate;
        let fromPlus1Yr = getFromPlus1Yr(from);

        if(to > fromPlus1Yr || nextTranType == 'Cr' || i == trans.length - 1){
          let finalResult;
          if(to > fromPlus1Yr){
            // remember Dr can also comer here // handle yr && multiple yrs // generate 1 tran on yr end 
            finalResult = calculatePSIForYears(from, to, masterObj.results[lastIndexOFResults]);
            finalResult.rate = firstTran.rate;
            finalResult.type = 'Dr';
            finalResult.mergedType = 'Yearly';
            masterObj.calcs.push(finalResult);
            console.log(finalResult);
          } 
          if(nextTranType == 'Cr'){
            // monthly
            let toCalcTrans = finalResult ? [finalResult] : masterObj.results[lastIndexOFResults];
            from = toCalcTrans[0].date;
            finalResult = calculatePSIForMonths(from, to,  toCalcTrans);
            finalResult.rate = firstTran.rate;
            finalResult.type = 'Dr';
            finalResult.mergedType = 'Credit';
            masterObj.calcs.push(finalResult);
            console.log(finalResult);

          }
          if(i == trans.length - 1){
            // monthly
            let toCalcTrans = finalResult ? [finalResult]: masterObj.results[lastIndexOFResults];
            from = toCalcTrans[0].date;
            finalResult = calculatePSIForMonths(from, to,  toCalcTrans);
            finalResult.rate = firstTran.rate;
            finalResult.type = 'Dr';
            finalResult.mergedType = 'Final';
            masterObj.calcs.push(finalResult);
            console.log(finalResult);

          }

          finalResult.rate = firstTran.rate;
          finalResult.type = 'Dr';
          let nextResultsToCalc = nextTran ? [finalResult, nextTran] : [finalResult];
          finalResult ? masterObj.results.push(nextResultsToCalc) :[];

        }else if(nextTranType == 'Dr'){
          let lastResult = Array.from(masterObj.results[lastIndexOFResults]);
          lastResult.push(nextTran);
          masterObj.results.push(lastResult);
          console.log(masterObj);
        }
      }
      console.log(masterObj);
      resolve(masterObj);
    })
    return p;
  }

  return {calculateFinalPSI, calculatePSIForYears, calculatePSIForMonths, calculateSI};

});
