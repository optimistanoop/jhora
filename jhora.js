let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.controller('jhoraCtrl', function($rootScope, $scope, $mdToast, $mdDialog, $mdDateLocale, $window, passbookService, TABS, CUSTOMER_SALUTATION, TOAST_DELAY, TOAST_POS, CUSTOMERS_TABLE, BALANCE_TABLE, BALANCE_COLUMNS) {
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

  $scope.openNav = () => {
    if ($scope.navClosed) {
      document.getElementById("mySidenav").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      $scope.navClosed = !$scope.navClosed;
    } else {
      $scope.navClosed = !$scope.navClosed;
      $scope.closeNav();
    }
  };

  $scope.closeNav = () => {
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
  };

  $scope.back = () => {
    $window.history.back();
  };

  $scope.sortBy = (propertyName) => {
    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
  };

  $rootScope.showToast = (msg) => {
    $mdToast.show($mdToast.simple().textContent(msg).position(TOAST_POS).hideDelay(TOAST_DELAY));
  };

  $rootScope.showAlertDialog = (ev, title, msg) => {
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

  $scope.showConfirmDialog = (ev, title, msg) => {
    let p = new Promise((resolve, reject) => {
      let confirm = $mdDialog.confirm()
      .title(title)
      .textContent(msg)
      .ariaLabel('Delete')
      .targetEvent(ev)
      .ok('Submit')
      .cancel('Cancel');

      $mdDialog.show(confirm).then((data) => {
        resolve(data);
      }, (err) => {});
    });
    return p;
  };

  $rootScope.showDialog = (ev, modelName, data, templateUrl, msg = '') => {
    let p = new Promise((resolve, reject) => {
      $mdDialog.show({
        controller: ($scope, $mdDialog) => {
          $scope.message = msg,
          $scope[modelName] = data;
          $scope.answer = function(answer) {
            $mdDialog.hide(answer);
          };
        },
        templateUrl: templateUrl,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: true
      })
      .then(function(answer) {
        resolve(answer);
      })
    });

    return p;
  };

  $scope.updateBal = () => {
    q.selectAll(BALANCE_TABLE)
    .then((rows) => {
      if (rows.length > 0) {
        let todayDay = new Date().getDate();
        let todayMonth = new Date().getMonth() + 1;
        let todayYear = new Date().getFullYear();
        let calcDay = new Date(rows[0].calcOn).getDate();
        let calcMonth = new Date(rows[0].calcOn).getMonth() + 1;
        let calcYear = new Date(rows[0].calcOn).getFullYear();
        if (!((todayMonth == calcMonth && todayYear == calcYear) && ((todayDay <= 15 && calcDay <= 15) || (todayDay <= 31 && calcDay <= 31 && todayDay > 15 && calcDay > 15)))) {
          return q.selectAll(CUSTOMERS_TABLE)
        }
      }
      return []
    })
    .then((custs) => {
      if (custs.length) {
        let promises = []
        let updatePromise = [];
        for (let cust of custs) {
          cust.date = cust.date ? new Date(cust.date) : null;
          updatePromise.push(passbookService.getUserData(cust.id)
          .then((datas) => {
            let balData = datas.results[datas.results.length - 1][0];
            let values = balData.customerId ? [balData.amount, balData.date, balData.calcTill, balData.calcOn, balData.customerId, balData.type, balData.p, balData.si, balData.rate, balData.total] : null;
            values && promises.push(q.update(BALANCE_TABLE, BALANCE_COLUMNS, values, 'customerId', balData.customerId));
          }))
        }

        Promise.all(updatePromise)
        .then((upt) => {
          return Promise.all(promises)
        })
        .then((update) => {
          $rootScope.showToast('Balances Updated');
          $rootScope.$emit('updateCustomers');
        })
      }
    })
    .catch((err) => {
      $scope.showAlertDialog({}, 'Error', err);
    })
  };

  $scope.updateBal();
  if(!isElectron()){
    navigator.serviceWorker && navigator.serviceWorker.register('/sw.js',  {scope: '/'}).then((registration)=>{
      console.log('registered with scope: ', registration.scope);
      }).catch((err)=>{
        console.error('service worker err', err);
      })
    }
  })
  .constant('TABS', [{
      title: 'Stats',
      route: '/'
    },
    {
      title: 'Add Customer',
      route: '/customers/add'
    },
    {
      title: 'Add Transaction',
      route: '/transactions/add'
    },
    {
      title: 'Customers',
      route: '/customers'
    },
    {
      title: 'Transactions',
      route: '/transactions'
    },
    {
      title: 'Villages',
      route: '/villages'
    },
    {
      title: 'Dashboard Demo',
      route: '/dashboard/view'
    },
    {
      title: 'Passbook Demo',
      route: '/passbook1/view'
    },
    {
      title: 'Settings',
      route: '/setting'
    }
  ])
  .constant('CUSTOMER_SALUTATION', ['Mr', 'Mrs', 'Miss'])
  .constant('TRANSACTION_TYPES', ['Dr', 'Cr', 'Settle'])
  .constant('UPDATE_TRANSACTION_TYPES', ['Dr', 'Cr'])
  .constant('VIEW_LIMITS', ['All', 'Deleted'])
  .constant('TRANS_LIMITS', ['All', 'Settled', 'Deleted'])
  .constant('CUSTOMERS_TABLE', 'customers')
  .constant('DELCUSTOMERS_TABLE', 'delcustomers')
  .constant('TRANSACTION_TABLE', 'transactions')
  .constant('DELTRANSACTION_TABLE', 'deltransactions')
  .constant('VILLAGE_TABLE', 'village')
  .constant('BALANCE_TABLE', 'balances')
  .constant('BALANCE_HISTORY_TABLE', 'balances_history')
  .constant('BALANCE_COLUMNS', ['amount', 'date', 'calcTill', 'calcOn', 'dueFrom', 'nextDueDate', 'customerId', 'type', 'p', 'si', 'rate', 'total'])
  .constant('BALANCE_HISTORY_COLUMNS', ['amount', 'date', 'calcTill', 'calcOn', 'dueFrom', 'nextDueDate', 'customerId', 'type', 'p', 'si', 'rate', 'total', 'action'])
  .constant('TOAST_DELAY', 3000)
  .constant('TOAST_POS', 'bottom right')
  .constant('CUSTOMERS_COLUMNS', ['id', 'salutation', 'name', 'pageNo', 'village', 'mobile', 'father', 'rate', 'guarantor', 'date', 'remarks'])
  .constant('TRANSACTION_COLUMNS', ['id', 'name', 'village', 'amount', 'rate', 'customerId', 'date', 'promiseDate', 'remarks', 'type'])
  .constant('TRANSACTION_EXPORT_COLUMNS', ['id', 'name', 'village', 'amount', 'rate', 'customerId', 'date', 'promiseDate', 'remarks', 'type', 'active'])
  .constant('VILLAGE_COLUMNS', ['id', 'name']);

  jhora.config(function($mdThemingProvider, $mdDateLocaleProvider, $routeProvider, $locationProvider) {

    $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow').dark();
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();

    $mdDateLocaleProvider.parseDate = function(dateString) {
      let dd = dateString ? new Date(dateString) : undefined;
      let formattedDate = '';
      if (dd) {
        let d = dd.getDate() < 10 ? '0' + (dd.getDate()) : dd.getDate();
        let m = dd.getMonth() < 9 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1;
        let y = dd.getFullYear();
        formattedDate = !isNaN(d) ? `${y}-${m}-${d}` : '';
      }
      return formattedDate ? formattedDate : '';
    };

    $mdDateLocaleProvider.formatDate = function(date) {
      let dd = date ? date : undefined;
      let formattedDate = '';
      if (dd) {
        let d = dd.getDate();
        let m = dd.getMonth();
        let y = dd.getFullYear();
        formattedDate = !isNaN(d) ? `${d}-${m + 1}-${y}` : null;
      }
      return formattedDate ? formattedDate : null;
    };

    let dir = '.';
    if(isElectron() && window.__dirname){
      dir = 'file://' + window.__dirname;
    }

    $routeProvider
    .when("/", {
      templateUrl: dir + '/stats/stats.html'
    })
    .when("/customers", {
      templateUrl: dir + '/customer/viewCustomer.html'
    })
    .when("/customers/add", {
      templateUrl: dir + '/customer/addCustomer.html'
    })
    .when("/customers/update/:id", {
      templateUrl: dir + '/customer/updateCustomer.html'
    })
    .when("/transactions", {
      templateUrl: dir + '/transaction/viewTransaction.html'
    })
    .when("/transactions/add", {
      templateUrl: dir + '/transaction/addTransaction.html'
    })
    .when("/transactions/add/:id", {
      templateUrl: dir + '/transaction/addTransaction.html'
    })
    .when("/transactions/update/:id", {
      templateUrl: dir + '/transaction/updateTransaction.html'
    })
    .when("/passbook/view/:id", {
      templateUrl: dir + '/passbook/viewPassbook.html'
    })
    .when("/villages", {
      templateUrl: dir + '/village/addViewVillage.html'
    })
    .when("/villages/view/:id", {
      templateUrl: dir + '/village/addViewVillage.html'
    })
    .when("/passbook1/view", {
      templateUrl: dir + '/passbook/viewPassbook1.html'
    })
    .when("/dashboard/view", {
      templateUrl: dir + '/dashboard/dashboard.html'
    })
    .when("/setting", {
      templateUrl: dir + '/setting/setting.html'
    });
    $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
  });
