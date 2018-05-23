
jhora.controller('addUpdateCustomerCtrl', function($rootScope, $scope, VIEW_LIMITS, CUSTOMERS_TABLE, DELCUSTOMERS_TABLE, TRANSACTION_TABLE) {
    
    $scope.customer = { name: '', mobile: '', address: '', father: '', rate: '', guarantor: '', date: undefined, pageNo: '', remarks: '' };
    $scope.editMode = $rootScope.editMode;
    $scope.editModeData = $rootScope.editModeData;
    $rootScope.editMode = false;
    $rootScope.editModeData = {};
    $scope.customer = $scope.editMode ? $scope.editModeData : $scope.customer;
    $scope.customer.date = undefined;
    $scope.submitBtnName = $scope.editMode ? 'Update' :'Submit';
    
    $scope.cancelUpdate = () =>{
      $rootScope.template = {title: 'Customer', content :'customer/customerView.html'};
    };
    
    $scope.resetCustomer = ()=>{
      $scope.customer ={};
      $scope.customerForm.$setPristine();
      $scope.customerForm.$setUntouched(); 
    };
    
    $scope.addCustomer = ()=>{
      let keys = Object.keys($scope.customer);
      let values = Object.values($scope.customer);
      q.insert(CUSTOMERS_TABLE, keys, values)
      .then((data)=>{
          $scope.resetCustomer();
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
      })
      .catch((err)=>{
          console.error('anp err occured while insertion')
      });  
    };
    
    $scope.updateCustomer = ()=>{
      let keys = Object.keys($scope.customer);
      let values = Object.values($scope.customer);
      let index = keys.indexOf('$$hashKey');
      if (index > -1) {
        keys.splice(index, 1);
        values.splice(index, 1);
      }
      let index1 = keys.indexOf('id');
      if (index1 > -1) {
        keys.splice(index1, 1);
        values.splice(index1, 1);
      }
      q.update(CUSTOMERS_TABLE, keys, values, 'id', $scope.customer.id)
      .then((data)=>{
          keys = ['name', 'address'];
          values = [$scope.customer.name, $scope.customer.address];
          return q.update(TRANSACTION_TABLE, keys, values, 'customerId', $scope.customer.id)
      })
      .then((data)=>{
        $scope.resetCustomer();
        dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
      })
      .catch((err)=>{
          console.error('anp err occured while insertion')
      });
    };
    
    $scope.submitCustomer = ()=>{
      $scope.editMode ?  $scope.updateCustomer(): $scope.addCustomer();
    };
    
  });