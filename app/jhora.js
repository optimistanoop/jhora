const {shell} = require('electron')
const {dialog} = require('electron').remote

let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($rootScope, $scope, TABS,CUSTOMER_SALUTATION) {
  $scope.salutation = CUSTOMER_SALUTATION;
  //$scope.villages = VILLAGES;
  $scope.currentNavItem = '0';
  $scope.navClosed = true;
  $scope.tabs = TABS;
  $rootScope.editMode = false;
  $rootScope.editModeData = {};

  $rootScope.template = $scope.tabs[3];
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
//.constant('VILLAGES', ['Daniyari', 'Garhia Mohan', 'Koindha', 'Chhapra Dalrai', 'Garhia Pathak', 'Sivrajpur', 'Pipra Misra', 'Chaupathia', 'Tariya Sujan', 'Other'])
.constant('TABS', [
  {title:'Add Customer', content:'customer/addCustomer.html'},
  {title:'Add Transaction', content:'transaction/addTransaction.html'},
  {title:'Customers', content:'customer/viewCustomer.html'},
  {title:'Transactions', content:'transaction/viewTransaction.html'},
  {title:'Villages', content:'village/addViewVillage.html'},
  {title:'Dashboard Demo', content:'dashboard/dashboard.html'},
  {title:'Passbook Demo', content:'passbook/viewPassbook1.html'}
])
.constant('CUSTOMER_SALUTATION',['Mr', 'Mrs', 'Miss'])
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

jhora.config(function($mdThemingProvider, $mdDateLocaleProvider,$routeProvider, $locationProvider) {
  $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow') .dark();
  $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
  $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
  $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
  $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();

  $mdDateLocaleProvider.parseDate = function(dateString) {

    // d.toISOString()
    // "2018-05-30T19:54:46.756Z"
    // d.toLocaleDateString()
    // "5/31/2018"
    let dd = dateString ? new Date(dateString) : undefined;
    let formattedDate = '';
    if(dd){
      let d = dd.getDate()< 9 ?  '0'+ (dd.getDate()) : dd.getDate();
      let m = dd.getMonth() < 9 ?  '0'+ (dd.getMonth()+1) : dd.getMonth();
      let y = dd.getFullYear();
      formattedDate = !isNaN(d) ? `${y}-${m}-${d}` :'';
    }
    return formattedDate ? formattedDate : '';
  };

  $mdDateLocaleProvider.formatDate = function(date) {
  let dd = date ? date : undefined;
  let formattedDate = '';
  if(dd){
    let d = dd.getDate();
    let m = dd.getMonth();
    let y = dd.getFullYear();
    formattedDate = !isNaN(d) ? `${d}-${m + 1}-${y}`:null;
  }

  return formattedDate ? formattedDate : null;
};
$routeProvider
    .when("/", {
        templateUrl : 'file://' + __dirname + '/customer/viewCustomer.html'
        //templateUrl : 'file://' + __dirname + '/index2.html'
    })
    .when("/customers", {
        templateUrl : 'file://' + __dirname + '/customer/viewCustomer.html'
    })
    .when("/customers/add", {
        templateUrl : 'file://' + __dirname + '/customer/addCustomers.html'
    })
    .when("/customers/update/:id", {
        templateUrl : 'file://' + __dirname + '/customer/updateCustomers.html'
    })
    .when("/transactions", {
        templateUrl : 'file://' + __dirname + '/transaction/viewTransactions.html'
    })
    .when("/transactions/add", {
        templateUrl : 'file://' + __dirname + '/transaction/addTransactions.html'
    })
    .when("/transactions/update/:id", {
        templateUrl : 'file://' + __dirname + '/transaction/updateTransactions.html'
    })
    .when("/passbook/view/:id", {
        templateUrl : 'file://' + __dirname + '/passbook/viewPassbook.html'
    });
    $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode({enabled: false, requireBase: false});
    // $locationProvider.html5Mode(true);
    // $locationProvider.html5Mode({ enabled: true, requireBase: false
});
