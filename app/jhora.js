
let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($rootScope, $scope, TABS,CUSTOMER_SALUTATION) {
  $scope.salutation = CUSTOMER_SALUTATION;
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

jhora.config(function($mdThemingProvider, $mdDateLocaleProvider) {
  $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow') .dark();
  $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
  $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
  $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
  $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();

  $mdDateLocaleProvider.parseDate = function(dateString) {
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
});

jhora.service('queryService', function(){
    this.selectAll = (tableName)=>{
        return q.selectAll(tableName);
    }
});
