angular.module('controllers').controller({
    'registerCtrl': ['$scope', 'starsAjax', '$rootScope', function($scope, starsAjax, $rootScope) {
        $scope.isModify = location.hash.indexOf('modify') === -1 ? false : true;
        //省
        $scope.getProvinces = function() {
            starsAjax.getProvinces(function(response) {
                $scope.provinces = response.data;
            });
        }

        $scope.getProvinces();

        //市
        $scope.getCities = function(provinceId) {
            $scope.cityId = "";
            $scope.countyId = "";
            starsAjax.getCities(function(response) {
                $scope.cities = response.data;
            },provinceId);
        }

        //县
        $scope.getCounties = function(cityId) {
            $scope.countyId = "";
            starsAjax.getCounties(function(response) {
                $scope.counties = response.data;
            },cityId);
        }

        //重置
        $scope.reset = function() {
            $scope.name = "";
            $scope.companyName = "";
            $scope.card = "";
            $scope.provinceId = "";
            $scope.cityId = "";
            $scope.countyId = "";
            $scope.address = "";
            $scope.phone = "";
            $scope.$$childHead.startTime = "";
            $scope.$$childTail.joinTime = "";
            $scope.price = "";
        }

        //保存
        $scope.save = function() {
            var data = {
                id: $rootScope.USERID || "",
                name: $scope.name,
                companyName: $scope.companyName,
                card: $scope.card,
                provinceId: $scope.provinceId,
                cityId: $scope.cityId,
                countyId: $scope.countyId,
                address: $scope.address,
                phone: $scope.phone,
                startTime: $scope.$$childHead.startTime,
                joinTime: $scope.$$childTail.joinTime,
                price: $scope.price
            };

            starsAjax.saveData(function(response) {
                if(response.status === 'success') {
                    location.hash = 'list';
                }
            }, data);
        };

        //modify
        if($scope.isModify) {
            starsAjax.modify(function(response) {
                $scope.name = response.name;
                $scope.companyName = response.companyName;
                $scope.card = response.card;
                $scope.provinceId = response.provinceId;
                if($scope.provinceId) {
                    $scope.getCities($scope.provinceId);
                };
                $scope.cityId = response.cityId;
                if($scope.cityId) {
                    $scope.getCounties($scope.cityId);
                };
                $scope.countyId = response.countyId;
                $scope.address = response.address;
                $scope.phone = response.phone;
                $scope.$$childHead.startTime = response.start;
                $scope.$$childTail.joinTime = response.join;
                $scope.price = response.price;
            },$rootScope.USERID)
        }

        //返回
        $scope.goBack = function() {
            location.hash = 'list';
        }
    }],
    'startCtrl': ['$scope', function($scope) {
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        $scope.validTime = function() {
            if(!$scope.startTime) {
                $scope.error = true;
            } else {
                $scope.error = false;
            }
        }
    }],
    'joinCtrl': ['$scope', function($scope) {
        $scope.openJoinTime= function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        $scope.validTime = function() {
            if(!$scope.joinTime) {
                $scope.error = true;
            } else {
                $scope.error = false;
            }
        }
    }],
    'listCtrl': ['$scope', '$compile', 'starsAjax', '$rootScope', function($scope, $compile, starsAjax,$rootScope) {
        var campListParams = [];
        $('.userGrid').flexigrid({
            url: '/stars/user',
            method: 'GET',
            dataType: 'json',
            colModel: [
                { display: '姓名', name: 'name', width: 1, sortable: true, align: 'center', dataindex: 'name' },
                { display: '公司名称', name: 'companyName', width: 1, sortable: true, align: 'left', dataindex: 'companyName'},
                { display: '创建时间', name: 'createdTime', width: 2, sortable: true, align: 'center', dataindex: 'createdTime'},
                {display: '联系方式', name: 'phone', width: 1, sortable: false, align: 'left', dataindex: 'phone'},
                {display: '详细地址', name: 'address', width: 2, sortable: false, align: 'left', dataindex: 'address'},
                {display: '签约开始时间', name: 'start', width: 2, sortable: false, align: 'left', dataindex: 'start'},
                {display: '签约结束时间', name: 'end', width: 2, sortable: false, align: 'left', dataindex: 'end'},
                {display: '签约时间', name: 'join', width: 2, sortable: false, align: 'left', dataindex: 'join'},
                {display: '价格', name: 'price', width: 1, sortable: false, align: 'left', dataindex: 'price'},
                {display: '编号', name: 'number', width: 1, sortable: false, align: 'left', dataindex: 'number'},
                {display: '操作', name: 'operation', width: 2, align: 'center', dataindex: 'campId', mapping: ['id'], convert: function (v, mappVal) {
                    return '<a href="javascript:void(0);" class="edit_delete edit_icon" title="查看" ng-click="gridObj.modify(\'' + mappVal[0] +'\')"></a><a href="javascript:void(0);" class="edit_delete delete_icon" title="删除" ng-click="gridObj.deleteItem(\'' + mappVal[0] +'\',$event)"></a>'
                }
                }

            ],
            params: campListParams,
            buttons: [],
            updateDefaultParam: true,
            searchitems: {display: '搜索账号/姓名/城市',name: ""},
            sortname: "id",
            sortorder: "desc",
            //searchitems :{display: '用户名', name : 'userName'},
            rp: 20,
            usepager: true,
            useRp: true,
            showTableToggleBtn: true,
            colAutoWidth: true,
            onSuccess: function () {
                var scope = angular.element(document.querySelector('.userGridWrap')).scope();
                scope.gridObj.compileTpl(scope);
            },
            onError: function (data, status, headers, config) {
                if( status !=0 || !data){
                    $(this).Alert({"title": data.message, "str": data.description, "mark": true});
                }
            }
        });
        $scope.defaultFlag = true;
        $scope.gridObj = {
            "compileTpl": function (b) {
                $compile(angular.element(".userGridWrap"))($scope || b);
                $scope.$apply();
            },
            'modify': function(id) {
                $rootScope.USERID = id;
                location.hash = 'modify';
            },
            "deleteItem": function (id,e) {
                var flag = window.confirm('确定删除当前客户');
                if(flag) {
                    starsAjax.deleteItem(function(response) {
                        if(response.status === 'success') {
                            angular.element(e.target).closest('tr').remove();
                        }
                    },id);
                }
            }
        };
    }]

});