
jhora.controller('viewCustomerCtrl', function($rootScope, $scope, $timeout, VIEW_LIMITS, CUSTOMERS_TABLE, DELCUSTOMERS_TABLE,TRANSACTION_TABLE) {
    const {shell} = require('electron');
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: null, pageNo: '', remarks: '' };
    $scope.hideNoDataFound = true;
    $rootScope.template = {title: 'Customers'};
    $scope.deleteCustomer=(ev,customer)=>{
      shell.beep();
      q.selectAllById(TRANSACTION_TABLE,'customerId',customer.id)
      .then((row)=>{
        if(row.length>0) {
          $rootScope.showAlertDialog(ev,`Customer in Use`, `Customer : ${customer.name} unable to delete .`);
        }
        else {
      $rootScope.showDialog(ev,'customer', customer, 'customer/previewCustomer.html','Are you sure to delete...?')
      .then((answer)=>{
        if(answer == 'submit') {
          $scope.confirmCustomer(customer);
        }
      });
    }
    })
  }
    $scope.confirmCustomer = (customer)=>{
        let  {name, mobile, village, father, rate, guarantor, date, pageNo, remarks,salutation } = customer;
        let keys = ['name', 'mobile', 'village', 'father', 'rate', 'guarantor', 'date', 'pageNo', 'remarks','salutation'];
        let values =[name, mobile, village, father, rate, guarantor, date, pageNo, remarks,salutation];
        q.insert(DELCUSTOMERS_TABLE, keys, values)
        .then((data)=>{
          return q.deleteRowById(CUSTOMERS_TABLE, customer.id);
        })
        .then((data)=>{
          $scope.getCustomers(CUSTOMERS_TABLE);
          $rootScope.showToast(`${customer.name}'s Customer Deleted`);
        })
        .catch((err)=>{
          console.error('anp an err occured while deleting', err);
        });
    }

    $scope.getCustomers = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
        }
        $timeout(()=>{
          $scope.hideNoDataFound = true;
          $scope.customers = rows;
          if(rows && rows.length == 0)
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
  });
