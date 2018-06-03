
jhora.controller('updateCustomerCtrl', function($rootScope, $scope, $timeout, $mdDateLocale, CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGE_TABLE) {

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
      let date = $mdDateLocale.parseDate($scope.customer.date);
      let keys = Object.keys($scope.customer);
      let indexDate = keys.indexOf('date');
      let values = Object.values($scope.customer);
      values[indexDate] = date;
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
        dialog.showMessageBox({type :'info', message:'Data updated', buttons:[]});
        $rootScope.template = {title: 'Customers', content:'customer/viewCustomer.html'}
      })
      .catch((err)=>{
          console.error('anp err occured while insertion',err);
          if (err.code=="SQLITE_CONSTRAINT") {
            dialog.showMessageBox({type :'info', message:'Mobile number is already in use', buttons:[]});
          }
      });
    };

    $scope.getVillages = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : undefined;
        }
        $timeout(()=>{
          $scope.villages = rows;
          if(tableName == VILLAGE_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false; 
        },0); 
      })
      .catch((err)=>{
        console.error(err);
      });
    };

    $scope.getVillages(VILLAGE_TABLE);

  });
