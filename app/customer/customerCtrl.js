
jhora.controller('customerCtrl', function($scope) {

    $scope.customer = {
      name: 'Addu',
      mobile: '9738275930',
      address: 'Daniyari',
      father: 'Pita G',
      guarantor: 'Naresh',
      date: new Date(),
      pageNo: '1',
      remarks: 'Some big natural remarks here!'
    };
    
    $scope.resetCustomer = function(){
      $scope.customer ={};
    };
    
    $scope.submitCustomer = function(){
      console.log('anp customer', $scope.customer);
      let keys = Object.keys($scope.customer);
      let values = Object.values($scope.customer);
      q.insert('customer', keys, values, (err)=>{
        if (err){
          console.err('anp err occured while insertion')
        }else{
          $scope.getCustomers();
        } 
      });
    };
    
    $scope.getCustomers = function(){
      q.selectAll('customer', function(rows){
        $scope.customers = rows;  
        console.log('anp data fetched', rows);
      });
    };
    
    $scope.getCustomers();
    
  });