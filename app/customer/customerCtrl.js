
jhora.controller('customerCtrl', function($scope) {

    $scope.customer = {
      name: 'Addu',
      mobile: '9738275930',
      address: 'Daniyari',
      father: 'Pita G',
      guarantor: 'Naresh',
      date: new Date(),
      pageNo: '1',
      remarks: 'remarks here!'
    };
        
    $scope.editCustomer = (customer)=>{
      console.log('anp edit', customer);
    };
    
    $scope.deleteCustomer = (customer)=>{
      shell.beep();
      dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: `Are you sure you want to delete ${customer.name}?`
      }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
            q.deleteRowById('customer', customer.id).then((data)=>{
              $scope.getCustomers();
              dialog.showMessageBox({type :'info', message:`${customer.name} deleted`, buttons:[]});
            }).catch((err)=>{
              console.error('anp an err occured while deleting', customer);
            });
          }
      })
    };
    
    $scope.resetCustomer = ()=>{
      $scope.customer ={};
    };
    
    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };
    
    $scope.submitCustomer = ()=>{
      console.log('anp customer', $scope.customer);
      let keys = Object.keys($scope.customer);
      let values = Object.values($scope.customer);
      q.insert('customer', keys, values, (err)=>{
        if (err){
          console.error('anp err occured while insertion')
        }else{
          $scope.getCustomers();
          //dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
        } 
      });
    };
    
    $scope.getCustomers = ()=>{
      q.selectAll('customer', (rows)=>{
        $scope.customers = rows;  
      });
    };
    
    $scope.getCustomers();
    
  });