
jhora.controller('updateCustomerCtrl', function($rootScope, $scope, $timeout, CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGES) {

    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: undefined, pageNo: '', remarks: '' };
    $scope.editModeData = $rootScope.editModeData;
    $rootScope.editModeData = {};
    $scope.customer = $scope.editModeData;

    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();

    $scope.querySearch = (search)=>{
      let result = [];
      for(let vil of VILLAGES){
        vil.toLowerCase().indexOf(search.toLowerCase()) > -1 ? result.push(vil) :'';
      }
      return result.length > 0 ? result :VILLAGES;;
    };

    $scope.cancelUpdate = () =>{
      $rootScope.template = {title: 'Customer', content :'customer/viewCustomer.html'};
    };

    $scope.resetCustomer = ()=>{
      $scope.customer ={};
      $scope.customerForm.$setPristine();
      $scope.customerForm.$setUntouched();
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
          keys = ['name', 'village'];
          values = [$scope.customer.name, $scope.customer.village];
          return q.update(TRANSACTION_TABLE, keys, values, 'customerId', $scope.customer.id)
      })
      .then((data)=>{
        $timeout(()=>{
          $scope.resetCustomer();
        },0);
        dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
        $rootScope.template = {title: 'Customers', content:'customer/viewCustomer.html'}
      })
      .catch((err)=>{
          console.error('anp err occured while insertion',err);
      });
    };

  });
