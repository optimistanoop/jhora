
jhora.controller('transectionCtrl', function($scope) {

    $scope.types = ['Cr', 'Dr', 'Settle'];
    $scope.transaction = { amount: '', date: undefined, promiseDate: undefined, type: '', customerId: '', 
      customer: '', address:'', remarks: ''
    };
    $scope.customer = { name: '', mobile: '', address: '', father: '', guarantor: '', rate:'', date: undefined, pageNo: '', remarks: '' };
    
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
      $scope.transaction ={};
      $scope.customer ={};
      $scope.transactionForm.$setPristine();
      $scope.transactionForm.$setUntouched(); 
    };
    
    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };
    
    $scope.submitTransection = ()=>{
      $scope.transaction.customerId = $scope.customer.id;
      $scope.transaction.customer = $scope.customer.name;
      $scope.transaction.address = $scope.customer.address;
      let keys = Object.keys($scope.transaction);
      let values = Object.values($scope.transaction);
      q.insert('transection', keys, values, (err)=>{
        if (err){
          console.error('anp err, transection insertion', err);
        }else{
          $scope.getDataByTable('transection');
          $scope.resetTransection();
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
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