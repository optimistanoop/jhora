jhora.controller('addViewVillageCtrl', function($rootScope, $scope, $timeout, $mdDialog, VIEW_LIMITS,CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGE_TABLE){

	$rootScope.template = {title: 'Add / View Villages'};
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
      $rootScope.template.title = 'Add / View Villages';
    };

    $scope.addVillage = (ev)=>{
      let keys = Object.keys($scope.village);
      let values = Object.values($scope.village);
	  $rootScope.isLoader = true;
      if($rootScope.editModeData == true){
		    q.update(VILLAGE_TABLE, keys, values, 'uId', $scope.village.uId)
		      .then((data)=>{
		      	$timeout(()=>{
			          $scope.resetVillage();
			        },0);
				$rootScope.showToast('Village updated');
		        $scope.getVillages(VILLAGE_TABLE);
				$rootScope.template = {title: 'Villages'};
		    })
		    .catch((err)=>{
		          $scope.getError(ev, err);
		    });
        }else{
			   q.insert(VILLAGE_TABLE, keys, values)
			    .then((data)=>{
			        $timeout(()=>{
			          $scope.resetVillage();
			        },0);
					$rootScope.showToast('Village Added');
			        $scope.getVillages(VILLAGE_TABLE);
					$rootScope.template = {title: 'Villages'};
			    })
			    .catch((err)=>{
			          $scope.getError(ev, err);
				});
    };
	};

	$scope.getError = (ev, error) => {
		$rootScope.showAlertDialog(ev,'Error', `${error}`);
		$scope.resetVillage();
	};

    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getVillages(VILLAGE_TABLE);
      }else{
        $scope.getVillages(VILLAGE_TABLE);
      }
    };

    $scope.getVillages = (tableName)=>{
	  $rootScope.isLoader = true;
      return q.selectAll(tableName)
      .then((rows)=>{
		$rootScope.isLoader = false;
        if(rows.length)
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
		$scope.showAlertDialog({}, 'Error', err);
      });
    };

	$scope.deleteVillage = (ev,village)=>{
      q.selectAllById(CUSTOMERS_TABLE,'village',village.name)
      .then((rows)=>{
        if (rows.length>0) {
          $rootScope.showAlertDialog(ev,`Village in Use`, `Village : ${village.name} unable to delete .`);
        } else{
			 $scope.showConfirmDialog(ev, 'Delete Village', `Are you sure to delete village: ${village.name} ?`)
			 .then((data)=>{
		      	$scope.confirmVillage(village);
		   	 })
			 .catch((err)=>{
				 $scope.showAlertDialog(ev, 'Error', err);
   			});
         }
       })
	};

    $scope.confirmVillage = (village)=>{
        return q.deleteRowById(VILLAGE_TABLE, village.uId)
          .then((data)=>{
          	$scope.getVillages(VILLAGE_TABLE);
			$rootScope.showToast('Village Deleted');
        })
        .catch((err)=>{
			$scope.showAlertDialog({}, 'Error', err);
        });
    }


    $scope.editVillage = (village)=>{
      q.selectAllById('customers', 'village', village.uId)
      .then((data)=>{
        console.log(data)
        if(data.length == 0){
          $scope.showAlertDialog({}, 'Info!!!', 'You can now edit '+ village.name + ' very soon');
        }else{
          $scope.showAlertDialog({}, 'Warning!!!', 'You can not edit '+ village.name+ " this vilage is used by "+data.length + 'customers');
        }
      })
    }

	$scope.getVillages(VILLAGE_TABLE);
});
