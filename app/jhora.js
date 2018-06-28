
let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($rootScope, $scope, $mdToast, $mdDialog, TABS,CUSTOMER_SALUTATION, TOAST_DELAY, TOAST_POS) {
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

  $scope.sortBy = (propertyName)=>{
    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
  };

  $rootScope.showToast = (msg)=>{
      $mdToast.show($mdToast.simple().textContent(msg).position(TOAST_POS).hideDelay(TOAST_DELAY));
  };

  $rootScope.showAlertDialog = (ev, title, msg)=>{
      $mdDialog.show(
          $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(false)
          .title(title)
          .textContent(msg)
          .ariaLabel('Alert Dialog Demo')
          .ok('Got it!')
          .theme('dark-orange')
          .targetEvent(ev)
      );
  };

  $rootScope.showDialog = (ev,modelName, data, templateUrl, msg ='')=>{
      let p =new Promise( (resolve, reject)=>{
          $mdDialog.show({
              controller: ($scope, $mdDialog)=>{
                  $scope.message = msg,
                  $scope[modelName] = data;
                  $scope.answer = function(answer) {
                      $mdDialog.hide(answer);
                  };
              },
              templateUrl: templateUrl,
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:false,
              fullscreen: true
          })
          .then(function(answer) {
              resolve(answer);
          })
      });

      return p;
  };

})
//.constant('VILLAGES', ['Daniyari', 'Garhia Mohan', 'Koindha', 'Chhapra Dalrai', 'Garhia Pathak', 'Sivrajpur', 'Pipra Misra', 'Chaupathia', 'Tariya Sujan', 'Other'])
.constant('TABS', [
  {title:'Add Customer',route:'/customers/add'},
  {title:'Add Transaction',route:'/transactions/add'},
  {title:'Customers',route:'/customers'},
  {title:'Transactions',route:'/transactions'},
  {title:'Villages',route:'/villages'},
  {title:'Dashboard Demo',route:'/dashboard/view'},
  {title:'Passbook Demo',route:'/passbook1/view'},
  {title:'Settings',route:'/setting'}
])
.constant('CUSTOMER_SALUTATION',['Mr', 'Mrs', 'Miss'])
.constant('TRANSACTION_TYPES', ['Dr', 'Cr', 'Settle'])
.constant('VIEW_LIMITS', ['All', 'Deleted'])
.constant('CUSTOMERS_TABLE', 'customers')
.constant('DELCUSTOMERS_TABLE', 'delcustomers')
.constant('TRANSACTION_TABLE', 'transactions')
.constant('DELTRANSACTION_TABLE', 'deltransactions')
.constant('VILLAGE_TABLE', 'village')
.constant('TOAST_DELAY', 3000)
.constant('TOAST_POS', 'bottom right')
.constant('CUSTOMERS_COLUMNS', ['id', 'salutation', 'name', 'pageNo', 'village', 'mobile', 'father', 'rate', 'guarantor', 'date', 'remarks'])
.constant('TRANSACTION_COLUMNS', ['id', 'name', 'village', 'amount', 'rate', 'customerId', 'date', 'promiseDate', 'remarks', 'type'])
.constant('VILLAGE_COLUMNS', ['id','name']);

jhora.config(function($mdThemingProvider, $mdDateLocaleProvider,$routeProvider, $locationProvider) {

  $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow') .dark();
  $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
  $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
  $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
  $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();

  $mdDateLocaleProvider.parseDate = function(dateString) {
    let dd = dateString ? new Date(dateString) : undefined;
    let formattedDate = '';
    if(dd){
      let d = dd.getDate()< 10  ?  '0'+ (dd.getDate()) : dd.getDate();
      let m = dd.getMonth() < 10 ?  '0'+ (dd.getMonth()+1) : dd.getMonth()+1;
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
          templateUrl : 'file://' + __dirname + '/village/addViewVillage.html'
      })
      .when("/customers", {
          templateUrl : 'file://' + __dirname + '/customer/viewCustomer.html'
      })
      .when("/customers/add", {
          templateUrl : 'file://' + __dirname + '/customer/addCustomer.html'
      })
      .when("/customers/update/:id", {
          templateUrl : 'file://' + __dirname + '/customer/updateCustomer.html'
      })
      .when("/transactions", {
          templateUrl : 'file://' + __dirname + '/transaction/viewTransaction.html'
      })
      .when("/transactions/add", {
          templateUrl : 'file://' + __dirname + '/transaction/addTransaction.html'
      })
      .when("/transactions/update/:id", {
          templateUrl : 'file://' + __dirname + '/transaction/updateTransaction.html'
      })
      .when("/passbook/view/:id", {
          templateUrl : 'file://' + __dirname + '/passbook/viewPassbook.html'
      })
      .when("/villages", {
          templateUrl : 'file://' + __dirname + '/village/addViewVillage.html'
      })
      .when("/villages/view/:id", {
          templateUrl : 'file://' + __dirname + '/village/addViewVillage.html'
      })
      .when("/passbook1/view", {
          templateUrl : 'file://' + __dirname + '/passbook/viewPassbook1.html'
      })
      .when("/dashboard/view", {
          templateUrl : 'file://' + __dirname + '/dashboard/dashboard.html'
      })
      .when("/setting", {
          templateUrl : 'file://' + __dirname + '/setting/setting.html'
      });
      $locationProvider.hashPrefix('!');
      $locationProvider.html5Mode({enabled: false, requireBase: false});
});
