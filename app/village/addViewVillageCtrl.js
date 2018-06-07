jhora.controller('addViewVillageCtrl', function($rootScope, $scope, $timeout, $mdDialog, $mdToast, VIEW_LIMITS,CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGE_TABLE){
	const {dialog} = require('electron').remote;
	const {shell} = require('electron');
	$scope.village = { name : ''} ;
	$scope.limits = VIEW_LIMITS;
  $scope.queryFor = $scope.limits[0];
	$scope.hideNoDataFound = true;
	$rootScope.editModeData = false;

	$scope.resetVillage = ()=>{
      $scope.village ={};
      $scope.villageForm.$setPristine();
      $scope.villageForm.$setUntouched();
      $rootScope.editModeData = false;
    };

    $scope.addVillage = ()=>{
      let keys = Object.keys($scope.village);
      let values = Object.values($scope.village);
      if($rootScope.editModeData == true){
		    q.update(VILLAGE_TABLE, keys, values, 'id', $scope.village.id)
		      .then((data)=>{
		      	$timeout(()=>{
			          $scope.resetVillage();
			        },0);
							$mdToast.show(
							$mdToast.simple()
							.textContent('Village updated.')
							.position('bottom right')
							.hideDelay(3000)
							);
		           $scope.getVillages(VILLAGE_TABLE);
		    })
		    .catch((err)=>{
		          console.error('anp err occured while updation',err);
		          $scope.getError(err);
		    });
        }
        else{
			   q.insert(VILLAGE_TABLE, keys, values)
			    .then((data)=>{
			        $timeout(()=>{
			          $scope.resetVillage();
			        },0);
							$mdToast.show(
							$mdToast.simple()
							.textContent('Village Added.')
							.position('bottom right')
							.hideDelay(3000)
							);
			          $scope.getVillages(VILLAGE_TABLE);
			    })
			    .catch((err)=>{
			          console.error('anp err occured while insertion',err);
			          $scope.getError(err);
			});
      }
    };

    $scope.getError = (error) => {
    	if (error.code=="SQLITE_CONSTRAINT") {
            dialog.showMessageBox({type :'info', message:'Village name already exist', buttons:[]});
            $scope.village.name ='';
		}
    }

    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getVillages(VILLAGE_TABLE);
      }else{
        $scope.getVillages(VILLAGE_TABLE);
      }
    };

    $scope.getVillages = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
        }
        $timeout(()=>{
          $scope.villages = rows;
					$scope.hideNoDataFound = true;
          if(tableName == VILLAGE_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        },0);
      })
      .catch((err)=>{
        console.error(err);
      });
    };
    $scope.getVillages(VILLAGE_TABLE);

    $scope.editVillage = (village)=>{
			$rootScope.editModeData = true;
	  	$scope.village.name = village.name;
	  	$scope.village.id = village.id;
    };
		$scope.deleteVillage = (ev,village)=>{
			shell.beep();
			let confirm = $mdDialog.confirm()
		         .title('Delete Village')
		         .textContent(`Are you sure to delete village: ${village.name} ?`)
		         .ariaLabel('Delete')
		         .targetEvent(ev)
		         .ok('Submit')
		         .cancel('Cancel');
			$mdDialog.show(confirm,village).then(function() {
				      $scope.confirmVillage(village);
				   },function() {
        });
			};
    $scope.confirmVillage = (village)=>{
            let  {name} = village;
            let keys = ['name'];
            let values =[name];
            return q.deleteRowById(VILLAGE_TABLE, village.id)
              .then((data)=>{
              $scope.getVillages(VILLAGE_TABLE);
							$mdToast.show(
							$mdToast.simple()
							.textContent('Village Deleted.')
							.position('bottom right')
							.hideDelay(3000)
							);
            })
            .catch((err)=>{
              console.error('anp an err occured while deleting', village);
            });
          }

     $scope.sortBy = (propertyName)=>{
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };
});
