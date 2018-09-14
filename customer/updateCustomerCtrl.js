
jhora.controller('updateCustomerCtrl', function($rootScope, $scope, $timeout, $mdDateLocale,$routeParams,$window, CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGE_TABLE, CUSTOMER_SALUTATION) {
    $rootScope.template = {title: 'Edit Customer'};
    $scope.custid = $routeParams.id;
    $scope.customer = {date:'',father:'',guarantor:'',id:'',mobile:'',name:'',pageNo:'',rate:'',remarks:'',salutation:'',village:''};
    $scope.salutations = CUSTOMER_SALUTATION;
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

    $scope.updateCustomer=(ev,customer)=>{
      $rootScope.showDialog(ev,'customer', customer, 'customer/previewCustomer.html')
      .then(function(answer) {
        if(answer == 'submit') {
          $scope.confirmCustomer(ev);
        }
      });
  }
    $scope.confirmCustomer = (ev)=>{
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
          $rootScope.showToast('Customer updated');
          $window.history.back();
          },0);
        })
      .catch((err)=>{
          if (err.code=="SQLITE_CONSTRAINT" && err.message.includes('customers.mobile')) {
            $rootScope.showAlertDialog(ev,'Duplicate Mobile Number Found', `Mobile Number : ${$scope.customer.mobile} is already in use.`);
            $scope.customer.mobile = '';
          }else if(err.code=="SQLITE_CONSTRAINT" && err.message.includes('customers.pageNo')){
            $rootScope.showAlertDialog(ev,'Duplicate Page Number Found', `Page Number : ${$scope.customer.pageNo} is already in use.`);
            $scope.customer.pageNo = '';
          }
      });
    };

    $scope.getVillages = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows.length)
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
        $scope.showAlertDialog({}, 'Error', err);
      });
    };

    $scope.init = ()=> {
      q.selectAllById(CUSTOMERS_TABLE, 'id', $scope.custid)
      .then((rows)=>
        $timeout(()=> {
        $scope.customer = rows[0];
        $scope.customer.date = $scope.customer.date ? new Date($scope.customer.date) : null;
      },0)
    )};

    $scope.getVillages(VILLAGE_TABLE);
    $scope.init();
  });
