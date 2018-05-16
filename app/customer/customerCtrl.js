
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
        
    $scope.editCustomer = (customer)=>{
      console.log('anp edit', customer);
    };
    
    $scope.deleteCustomer = (customer)=>{
      console.log('anp delete', customer);
      shell.beep();
    };
    
    $scope.resetCustomer = ()=>{
      $scope.customer ={};
    };
    
    $scope.submitCustomer = ()=>{
      console.log('anp customer', $scope.customer);
      let keys = Object.keys($scope.customer);
      let values = Object.values($scope.customer);
      q.insert('customer', keys, values, (err)=>{
        if (err){
          console.err('anp err occured while insertion')
        }else{
          $scope.getCustomers();
          //dialog.showMessageBox({type :'info', message:'Data submitted', buttons:[]});
        } 
      });
    };
    
    $scope.getCustomers = ()=>{
      q.selectAll('customer', (rows)=>{
        $scope.customers = rows;  
      });
    };
    
    $scope.getCustomers();
    
  });