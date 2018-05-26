
jhora.controller('addCustomerCtrl', function($rootScope, $scope, CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGES) {
    
    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: undefined, pageNo: '', remarks: '' };
    
    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    
    $scope.querySearch = (search)=>{
      let result = [];
      for(let vil of VILLAGES){
        vil.toLowerCase().indexOf(search.toLowerCase()) > -1 ? result.push(vil) :'';
      }
      return result.length > 0 ? result :VILLAGES;;
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
    
  });