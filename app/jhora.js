const {shell} = require('electron')
const {dialog} = require('electron').remote

let jhora = angular.module('jhora', ['ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($scope) {
  $scope.villages = ['Daniyari', 'Gadahia Mohan', 'Koindaha'];
  $scope.selectedIndex = 0;
  $scope.tabs = [{title:'Customer', content:'customer/customer.html'}, 
                 {title:'View Customer', content:'customer/customerView.html'},
                 {title:'Transection', content:'transection/transection.html'},
                 {title:'View Transection', content:'transection/transectionView.html'}
               ];
  $scope.tab = $scope.tabs[0].content;
  $scope.goto = function(page) {
    $scope.tab = $scope.tabs[page].content;
  };             
})
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('yellow')
    .dark();

});