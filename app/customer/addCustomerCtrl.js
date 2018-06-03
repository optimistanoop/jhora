
jhora.controller('addCustomerCtrl', function($rootScope, $scope, $timeout,$mdDateLocale, CUSTOMERS_TABLE, TRANSACTION_TABLE,VILLAGE_TABLE) {

    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: null, pageNo: '', remarks: '' };

    $scope.minDate = new Date(new Date().getFullYear() -5, new Date().getMonth(), new Date().getDate());
    $scope.maxDate = new Date();

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

    $scope.addCustomer = ()=>{
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
          dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
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
