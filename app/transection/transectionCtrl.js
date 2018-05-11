
jhora.controller('transectionCtrl', function($scope) {

    $scope.transection = {
      amount: 100,
      rate: 2,
      date: new Date(),
      promiseDate: new Date(),
      type: 'Cr',
      customerId: 1,
      customer: 'Addu',
      remarks: 'Some big natural remarks here!'
    };
    
    $scope.resetTransection = ()=>{
      $scope.transection ={};
    };
    
    $scope.submitTransection = ()=>{
      console.log('anp transection', $scope.transection);
      let keys = Object.keys($scope.transection);
      let values = Object.values($scope.transection);
      q.insert('transection', keys, values, (err)=>{
        if (err){
          console.err('anp err, transection insertion')
        }else{
          $scope.getTransections();
        } 
      });
    };
    
    $scope.getTransections = ()=>{
      q.selectAll('transection', (rows)=>{
        $scope.transections = rows;  
        console.log('anp transection data fetched', rows);
      });
    };
    
    $scope.getTransections();
    
  });