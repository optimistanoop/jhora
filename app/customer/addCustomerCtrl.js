
  jhora.controller('addCustomerCtrl', function($rootScope, $scope, $timeout,$mdDateLocale, $mdDialog, CUSTOMERS_TABLE, TRANSACTION_TABLE,VILLAGE_TABLE, CUSTOMER_SALUTATION) {

    $scope.salutations = CUSTOMER_SALUTATION;
    $scope.customer = {salutation: $scope.salutations[0], name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: null, pageNo: '', remarks: '' };

    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();

    $scope.searchVillage = (keyword)=>{
      let result = [];
      let villages = [];
      for(let vil of $scope.villages){
        vil.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1 ? result.push(vil.name) : villages.push(vil.name);
      }
      return result.length > 0 ? result :villages;
    };

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
        $rootScope.showToast('Customer Added.');
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
          row.date = row.date ? new Date(row.date) : null;
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
