let jhora = angular.module('jhora', ['ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($scope) {
  $scope.villages = ['Daniyari', 'Gadahia Mohan'];
  $scope.selectedIndex = 0;
  $scope.tabs = [{title:'Customer', content:'customer/customer.html'}, 
                 {title:'View Customer', content:'customer/customerView.html'},
                 {title:'Transection', content:'transection/transection.html'},
                 {title:'View Transection', content:'transection/transectionView.html'}
               ];
})
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('yellow')
    .dark();

});