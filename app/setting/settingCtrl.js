jhora.controller('settingCtrl', function($rootScope, $scope, $timeout){
  $scope.hello = 'Hello world';
  $scope.backup = ()=>{
    console.log('anp backup');
    // q.takeBackup(tableName)
    // .then((data)=>{
    //   console.log('anp data came', data);
    // }).catch((err)=>{
    //   console.log('anp err came', err);
    // })
  };

});
