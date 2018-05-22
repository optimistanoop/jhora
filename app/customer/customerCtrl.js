
jhora.controller('customerCtrl', function($scope, VIEW_LIMITS, CUSTOMERS_TABLE, DELCUSTOMERS_TABLE) {
    
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.customer = { name: '', mobile: '', address: '', father: '', rate: '', guarantor: '', date: undefined, pageNo: '', remarks: '' };
        
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
          if (response === 0) {
            let  {name, mobile, address, father, rate, guarantor, date, pageNo, remarks } = customer;
            let keys = ['name', 'mobile', 'address', 'father', 'rate', 'guarantor', 'date', 'pageNo', 'remarks'];
            let values =[name, mobile, address, father, rate, guarantor, date, pageNo, remarks];
            q.insert(DELCUSTOMERS_TABLE, keys, values)
            .then((data)=>{
              return q.deleteRowById(CUSTOMERS_TABLE, customer.id);
            })
            .then((data)=>{
              $scope.getCustomers(CUSTOMERS_TABLE);
              dialog.showMessageBox({type :'info', message:`${customer.name} deleted`, buttons:[]});
            })
            .catch((err)=>{
              console.error('anp an err occured while deleting', customer);
            });
          }
      })
    };
    
    $scope.resetCustomer = ()=>{
      $scope.customer ={};
      $scope.customerForm.$setPristine();
      $scope.customerForm.$setUntouched(); 
    };
    
    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };
    
    $scope.submitCustomer = ()=>{
      let keys = Object.keys($scope.customer);
      let values = Object.values($scope.customer);
      q.insert(CUSTOMERS_TABLE, keys, values)
      .then((data)=>{
          $scope.getCustomers(CUSTOMERS_TABLE);
          $scope.resetCustomer();
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
      })
      .catch((err)=>{
          console.error('anp err occured while insertion')
      });
    };
    
    $scope.getCustomers = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        $scope.customers = rows; 
      })
      .catch((err)=>{
        console.error(err);
      });
    };
    
    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getCustomers(DELCUSTOMERS_TABLE);
      }else{
        $scope.getCustomers(CUSTOMERS_TABLE);
      }
    }
    $scope.getCustomers(CUSTOMERS_TABLE);
    
  });