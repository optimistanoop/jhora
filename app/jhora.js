const {shell} = require('electron')
const {dialog} = require('electron').remote

let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($rootScope, $scope, VILLAGES, TABS) {
  $scope.villages = VILLAGES;
  $scope.currentNavItem = '0';
  $scope.navClosed = true;
  $scope.tabs = TABS;
  $rootScope.editMode = false;
  $rootScope.editModeData = {};
  
  $rootScope.template = $scope.tabs[0];
  $scope.goto = function(page) {
    $rootScope.template = $scope.tabs[page];
    $scope.closeNav();
  };
  
  $scope.openNav = ()=> {
    if($scope.navClosed){
      document.getElementById("mySidenav").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      $scope.navClosed = ! $scope.navClosed;
    }else{
      $scope.navClosed = ! $scope.navClosed;
      $scope.closeNav();
    }
  };

  $scope.closeNav = ()=>{
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
  };
               
})
.constant('VILLAGES', ['Daniyari', 'Garhia Mohan', 'Koindha', 'Chhapra Dalrai', 'Garhia Pathak', 'Sivrajpur', 'Pipra Misra', 'Chaupathia', 'Tariya Sujan', 'Other'])
.constant('TABS', [
  {title:'Add Customer', content:'customer/addCustomer.html'},
  {title:'Add Transaction', content:'transaction/addTransaction.html'},
  {title:'Customers', content:'customer/viewCustomer.html'},
  {title:'Transactions', content:'transaction/viewTransaction.html'},
  {title:'Villages', content:'village/addViewVillage.html'}
])
.constant('TRANSACTION_TYPES', ['Dr', 'Cr', 'Settle'])
.constant('VIEW_LIMITS', ['All', 'Deleted'])
.constant('CUSTOMERS_TABLE', 'customers')
.constant('DELCUSTOMERS_TABLE', 'delcustomers')
.constant('TRANSACTION_TABLE', 'transactions')
.constant('DELTRANSACTION_TABLE', 'deltransactions')
.constant('VILLAGE_TABLE', 'village');

// jhora.config(function($routeProvider, $locationProvider) {
//     $routeProvider
//     .when("/", {
//         templateUrl : "index2.html"
//     });
//     $locationProvider.hashPrefix('!');
//     $locationProvider.html5Mode({enabled: false, requireBase: false});
//     $locationProvider.html5Mode(true);
//     $locationProvider.html5Mode({
//       enabled: true,
//       requireBase: false
//     });
// });
jhora.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow') .dark();
  $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
  $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
  $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
  $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
});
