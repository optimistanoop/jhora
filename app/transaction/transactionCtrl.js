
jhora.controller('transectionCtrl', function($scope) {

    $scope.types = ['Cr', 'Dr', 'Settle'];
    $scope.transection = { amount: 100, rate: 2, date: new Date(), promiseDate: new Date(), type: 'Cr', customerId: 1, 
      customer: '', address:'', remarks: 'remarks here!'
    };
    $scope.customer = { name: '', mobile: '', address: '', father: '', guarantor: '', date: '', pageNo: '', remarks: '' };
    
    $scope.editTransection = (transection)=>{
      console.log('anp edit', transection);
    };
    
    $scope.deleteTransection = (transection)=>{
      shell.beep
      dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: `Are you sure you want to delete ${transection.customer}'s transaction'?`
      }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
            q.deleteRowById('transection', transection.id).then((data)=>{
              $scope.getDataByTable('transection');
              dialog.showMessageBox({type :'info', message:`${transection.customer}'s transaction deleted`, buttons:[]});
            }).catch((err)=>{
              console.error('anp an err occured while deleting', transection);
            });
          }
      })
    };
    
    $scope.resetTransection = ()=>{
      $scope.transection ={};
      $scope.customer ={};
    };
    
    $scope.submitTransection = ()=>{
      $scope.transection.customerId = $scope.customer.id;
      $scope.transection.customer = $scope.customer.name;
      $scope.transection.address = $scope.customer.address;
      let keys = Object.keys($scope.transection);
      let values = Object.values($scope.transection);
      q.insert('transection', keys, values, (err)=>{
        if (err){
          console.error('anp err, transection insertion', err);
        }else{
          $scope.getDataByTable('transection');
          //dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
        } 
      });
    };
    
    $scope.getDataByTable = (table)=>{
      q.selectAll(table, (rows)=>{  
        if(rows)
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