
jhora.controller('viewCustomerCtrl', function($rootScope, $scope, $timeout,$mdDialog,$mdToast, VIEW_LIMITS, CUSTOMERS_TABLE, DELCUSTOMERS_TABLE) {

    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: undefined, pageNo: '', remarks: '' };
    $scope.hideNoDataFound = true;

    $scope.editCustomer = (customer)=>{
      // TODO
      $rootScope.editModeData = customer;
      $rootScope.template = {title: 'Edit Customer', content :'customer/updateCustomer.html'};

    };
    $scope.deleteCustomer=(ev,Customer)=>{
      shell.beep()
      $mdDialog.show({
      controller: ($scope, $mdDialog)=>{
        $scope.message = 'Are you sure to delete...?'
        $scope.Customer = Customer;
        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
      },
     templateUrl: 'customer/previewCustomer.html',
     parent: angular.element(document.body),
     targetEvent: ev,
     clickOutsideToClose:false,
     fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
   })
   .then(function(answer) {
     if(answer == 'submit') {
       $scope.confirmCustomer(Customer);
     }
   });
  }
    $scope.confirmCustomer = (customer)=>{
            let  {name, mobile, village, father, rate, guarantor, date, pageNo, remarks } = customer;
            let keys = ['name', 'mobile', 'village', 'father', 'rate', 'guarantor', 'date', 'pageNo', 'remarks'];
            let values =[name, mobile, village, father, rate, guarantor, date, pageNo, remarks];
            q.insert(DELCUSTOMERS_TABLE, keys, values)
            .then((data)=>{
              return q.deleteRowById(CUSTOMERS_TABLE, customer.id);
            })
            .then((data)=>{
              $scope.getCustomers(CUSTOMERS_TABLE);
              $mdToast.show(
              $mdToast.simple()
              .textContent(`${customer.name}'s Customer Deleted.`)
              .position('bottom right')
              .hideDelay(3000)
              );
            })
            .catch((err)=>{
              console.error('anp an err occured while deleting', err);
            });
          }

    $scope.sortBy = function(propertyName) {
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.getCustomers = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : undefined;
        }
        $timeout(()=>{
          $scope.customers = rows;
          if(tableName == CUSTOMERS_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        },0);
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
    };
    $scope.getCustomers(CUSTOMERS_TABLE);

   $scope.viewCustomerPassbook = (customer)=>{
    // TODO
    $rootScope.viewPassbookData = customer;
    $rootScope.template = {title: `Passbook for A/c No.-${customer.id}` , content :'passbook/viewPassbook.html'};
   };

  });
