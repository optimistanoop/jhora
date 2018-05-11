jhora.controller('customerCtrl', function($scope) {
    $scope.villages = ['Daniyari', 'Gadahia Mohan'];
    $scope.selectedIndex = 0;
    $scope.tabs = [{title:'Customer', content:'customer/customer.html'}, {title:'Customer View', content:'customer/customerView.html'}];
    $scope.customer = {
      name: 'Addu',
      mobile: '9738275930',
      address: 'Daniyari',
      fathersName: 'Pita G',
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
    };
    
  });