
  jhora.controller('addCustomerCtrl', function($rootScope, $scope,$window, $timeout,$mdDateLocale, $mdDialog, CUSTOMERS_TABLE, TRANSACTION_TABLE,VILLAGE_TABLE, CUSTOMER_SALUTATION) {

    $scope.salutations = CUSTOMER_SALUTATION;
    $scope.customer = {salutation: $scope.salutations[0], name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: null, pageNo: '', remarks: '' };
    $scope.columnName = `Father's Name`;
    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();
    $scope.setColumn = (salute)=>{
      if(salute == 'Mrs'){
        $scope.columnName = `Husband Name` ;
      }else {
        $scope.columnName = `Father's Name`;
      }  
    }
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
      $scope.customer.salutation = $scope.salutations[0];
      $scope.columnName = `Father's Name`;
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
        $rootScope.showToast('Customer Added');
      })
      .catch((err)=>{
          if (err.code=="SQLITE_CONSTRAINT" && err.message.includes('customers.mobile')) {
            $rootScope.showAlertDialog(ev,'Duplicate Mobile Number', `Mobile Number : ${$scope.customer.mobile} is already in use.`);
            $scope.customer.mobile = '';
          }else if(err.code=="SQLITE_CONSTRAINT" && err.message.includes('customers.pageNo')){
            $rootScope.showAlertDialog(ev,'Duplicate Page Number', `Page Number : ${$scope.customer.pageNo} is already in use.`);
            $scope.customer.pageNo = '';
          }
      });
    };

     $scope.getVillages = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows.length)
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
        $scope.showAlertDialog({}, 'Error', err);
      });
    };
    
    $scope.getVillages(VILLAGE_TABLE);

  });
