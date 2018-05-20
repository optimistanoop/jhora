const {shell} = require('electron')
const {dialog} = require('electron').remote

let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "index2.html"
    });
    //$locationProvider.hashPrefix('!');
    //$locationProvider.html5Mode({enabled: false, requireBase: false});
    //$locationProvider.html5Mode(true);
    // $locationProvider.html5Mode({
    //   enabled: true,
    //   requireBase: false
    // });
});
jhora.controller('jhoraCtrl', function($scope) {
  $scope.villages = ['Daniyari', 'Garhia Mohan', 'Koindha', 'Chhapra Dalrai', 'Garhia Pathak', 'Sivrajpur', 'Pipra Misra', 'Chaupathia', 'Tariya Sujan', 'Other'];
  $scope.currentNavItem = '0';
  $scope.tabs = [
    {title:'Customer', content:'customer/customer.html'},
    {title:'Transaction', content:'transaction/transaction.html'},
    {title:'View Customer', content:'customer/customerView.html'},
    {title:'View Transaction', content:'transaction/transactionView.html'}
  ];
  
  $scope.template = $scope.tabs[0];
  $scope.goto = function(page) {
    $scope.template = $scope.tabs[page];
    $scope.closeNav();
  };
  
  $scope.openNav = ()=> {
    let nav_value = document.getElementById("nav_value").value ;
    if(nav_value == 1){
      document.getElementById("mySidenav").style.width = "250px";
      document.getElementById("temp").style.marginLeft = "250px";
      document.getElementById("nav_value").value = 0;
    }else{
       $scope.closeNav();
    }
  };

  $scope.closeNav = ()=>{
    document.getElementById("mySidenav").style.width = "0";
     document.getElementById("temp").style.marginLeft = "0px";
    document.getElementById("nav_value").value = 1;
  };
               
});
// .config(function($mdThemingProvider) {
//   $mdThemingProvider.theme('docs-dark', 'default')
//     .primaryPalette('yellow')
//     .dark();
// 
// });
