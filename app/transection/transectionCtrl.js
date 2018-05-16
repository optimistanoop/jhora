
jhora.controller('transectionCtrl', function($scope) {

    $scope.types = ['Cr', 'Dr'];
    $scope.transection = { amount: 100, rate: 2, date: new Date(), promiseDate: new Date(), type: 'Cr', customerId: 1, 
      customer: 'Addu', remarks: 'remarks here!'
    };
    $scope.customer = { name: '', mobile: '', address: '', father: '', guarantor: '', date: '', pageNo: '', remarks: '' };
    
    $scope.editTransection = (transection)=>{
      console.log('anp edit', transection);
    };
    
    $scope.deleteTransection = (transection)=>{
      console.log('anp delete', transection);
      shell.beep();
    };
    
    $scope.resetTransection = ()=>{
      $scope.transection ={};
      $scope.customer ={};
    };
    
    $scope.submitTransection = ()=>{
      $scope.transection.customerId = $scope.customer.id;
      console.log('anp transection', $scope.transection);
      let keys = Object.keys($scope.transection);
      let values = Object.values($scope.transection);
      q.insert('transection', keys, values, (err)=>{
        if (err){
          console.err('anp err, transection insertion')
        }else{
          $scope.getDataByTable('transection');
          //dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
        } 
      });
    };
    
    $scope.getDataByTable = (table)=>{
      q.selectAll(table, (rows)=>{  
        for(let row of rows){
          row.date = new Date(row.date);
          if(table == 'transection')  
          row.promiseDate = new Date(row.promiseDate);
        }
        $scope[table+'s'] = rows;  
      });
    };
    
    $scope.getDataByTable('transection');
    $scope.getDataByTable('customer');
    
  });