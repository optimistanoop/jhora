
  jhora.controller('addCustomerCtrl', function($rootScope, $scope, $timeout,$mdDateLocale,$mdToast,$mdDialog, CUSTOMERS_TABLE, TRANSACTION_TABLE,VILLAGE_TABLE, CUSTOMER_SALUTATION) {

    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: undefined, pageNo: '', remarks: '', salutation: '' };

    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.salutation = CUSTOMER_SALUTATION;
    console.log("types :",$scope.salutation);

    /*$scope.querySearch = (search)=>{
      let result = [];
      for(let vil of VILLAGES){
        vil.toLowerCase().indexOf(search.toLowerCase()) > -1 ? result.push(vil) :'';
      }
      return result.length > 0 ? result :VILLAGES;;
    };*/

    $scope.resetCustomer = ()=>{
      $scope.customer ={};
      $scope.customerForm.$setPristine();
      $scope.customerForm.$setUntouched();
    };

    $scope.addCustomer = (ev)=>{
      let date = $mdDateLocale.parseDate($scope.customer.date);
      let keys = Object.keys($scope.customer);
      let index = keys.indexOf('date')
      let values = Object.values($scope.customer);
      values[index] = date;
      q.insert(CUSTOMERS_TABLE, keys, values)
      .then((data)=>{
        $timeout(()=>{
          $scope.resetCustomer();
        },0);
        $mdToast.show(
        $mdToast.simple()
        .textContent('Trasaction Added.')
        .position('bottom right')
        .hideDelay(3000)
        );
      })
      .catch((err)=>{
          console.error('anp err occured while insertion',err);
          if (err.code=="SQLITE_CONSTRAINT") {
            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(false)
              .title('Duplicate Mobile Number Found')
              .textContent(`Mobile Number : ${$scope.customer.mobile} is already in use.`)
              .ariaLabel('Alert Dialog Demo')
              .ok('Change It!')
              .theme('dark-orange')
              .targetEvent(ev)
    );
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
