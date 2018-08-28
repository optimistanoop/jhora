
let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($rootScope, $scope, $mdToast, $mdDialog, $mdDateLocale,passbookService, TABS,CUSTOMER_SALUTATION, TOAST_DELAY, TOAST_POS, CUSTOMERS_TABLE,BALANCE_TABLE,BALANCE_COLUMNS) {
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
  
  $scope.showConfirmDialog = (ev, title, msg)=>{
    let p =new Promise( (resolve, reject)=>{
      let confirm = $mdDialog.confirm()
      .title(title)
      .textContent(msg)
      .ariaLabel('Delete')
      .targetEvent(ev)
      .ok('Submit')
      .cancel('Cancel');
      
      $mdDialog.show(confirm).then((data)=>{
        resolve(data);
      },(err)=>{
      });
    });
    return p;
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
  
  $scope.updateBal = ()=>{
    q.selectAll(BALANCE_TABLE)
    .then((rows)=>{
      if(rows.length > 0) {
        let todayDay = new Date().getDate();
        let todayMonth = new Date().getMonth()+1;
        let todayYear = new Date().getFullYear();
        let calcDay = new Date(rows[0].calcOn).getDate();
        let calcMonth = new Date(rows[0].calcOn).getMonth()+1;
        let calcYear = new Date(rows[0].calcOn).getFullYear();
        console.log(todayDay,todayMonth,todayYear,calcDay,calcMonth,calcYear);
        if ((todayDay <= 15 && calcDay <= 15 && todayMonth == calcMonth && todayYear == calcYear) || (todayDay <= 31 && calcDay <= 31 && todayDay > 15 && calcDay > 15 && todayMonth == calcMonth && todayYear == calcYear )) {
          console.log("in the second if");
        }
        else {
          console.log("in the second else");
          q.selectAllTwoTable('customers c','balances b','c.id','c.id','b.customerId','WHERE b.customerId IS NULL')
          .then((NoMatch)=>{
            if(NoMatch.length>0) {
              console.log("non matching",NoMatch[0].id)
              let balPromise = [];
              let userPromise = [];
              for(let i of NoMatch) {
                // i.date = i.date ? new Date(i.date) : null;
                userPromise.push(passbookService.getUserData(i.id)
                .then((bal)=>{
                  if(bal.results.length>1) {
                  let balData = bal.results[bal.results.length-1][0];
                  let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                    balPromise.push(q.insert(BALANCE_TABLE, BALANCE_COLUMNS, values));
                  }
                }))
              }
              Promise.all(userPromise)
              .then((user)=>{
                Promise.all(balPromise)
                .then((insert)=>{
                $rootScope.showToast('Balances Updated');
                $rootScope.$emit('updateCustomers');
              })
                .catch((err)=>{
                  console.error("Error while insertion",err);
                  });
              })

            }
            })
              console.log("only update");
              q.selectAll(CUSTOMERS_TABLE)
              .then((custs)=> {
              if(custs.length > 0) {
                let promises = []
                let updatePromise = [];
                for(let cust of custs){
                cust.date = cust.date ? new Date(cust.date) : null;
                updatePromise.push(passbookService.getUserData(cust.id)
                .then((datas)=>{
                  if(datas.results.length>1) {
                  let balData = datas.results[datas.results.length-1][0];
                  let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                  promises.push(q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId));
                }
                }))
              }
              Promise.all(updatePromise)
              .then((upt)=>{
                Promise.all(promises)
                .then((update)=>{
                $rootScope.showToast('Balances Updated');
                $rootScope.$emit('updateCustomers');
              })
              })
              
          }
        })

        }
      }
      else {
        console.log("in the first else");
        q.selectAll(CUSTOMERS_TABLE)
        .then((custs)=> {
          if(custs.length > 0) {
            let promises = [];
            let insertPromise =[];
            for(let cust of custs){
              cust.date = cust.date ? new Date(cust.date) : null;
              insertPromise.push(passbookService.getUserData(cust.id)
              .then((data)=>{
                if(data.results.length>1) {
                  console.log(data.results.length);
                let balData = data.results[data.results.length-1][0];
                let values = [balData.amount,balData.date,balData.calcTill,balData.calcOn,balData.customerId,balData.type,balData.p,balData.si,balData.rate,balData.total];
                promises.push(q.insert(BALANCE_TABLE, BALANCE_COLUMNS, values));
              }
              }))
            }
            Promise.all(insertPromise)
            .then((insert)=>{
              Promise.all(promises)
              .then((ins)=>{
                $rootScope.showToast('Balances Updated');
                $rootScope.$emit('updateCustomers');
              })
            })

          }
        })
      }
    })
  };

$scope.updateBal();
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
.constant('BALANCE_TABLE', 'balances')
.constant('BALANCE_COLUMNS',['amount','date','calcTill','calcOn','customerId','type','p','si','rate','total'])
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
