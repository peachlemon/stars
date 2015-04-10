angular.module('services').factory('starsAjax', ['$http', function($http) {
    return {
        'saveData': function(callback, data){
            $http({
                method: 'post',
                url: '/stars/user',
                data: data
            }).success(function (data, status, headers, config) {
                callback(data);
                /*返回的案例
                *{status：‘success’}
                */
            }).error(function (data, status, headers, config) {
                $(this).Alert({"title": data.message, "str": data.description, "mark": true});
            });
        },
        'getProvinces': function(callback){
            $http({
                method: 'get',
                url: '/stars/provices'
            }).success(function (data, status, headers, config) {
                callback(data);
                /*
                *{data:[{id: 1,name: '上海'},{id: 2,name: '北京'}]}
                */
            }).error(function (data, status, headers, config) {
                $(this).Alert({"title": data.message, "str": data.description, "mark": true});
            });
        },
        'getCities': function(callback, proviceId){
            $http({
                method: 'get',
                url: '/stars/cities?proviceId=' + proviceId
            }).success(function (data, status, headers, config) {
                callback(data);
                /*没有数据就空数组 []
                 *{data:[{id: 1,name: '上海',provinceId: 1},{id: 2,name: '北京',provinceId: 1}]}
                 */
            }).error(function (data, status, headers, config) {
                $(this).Alert({"title": data.message, "str": data.description, "mark": true});
            });
        },
        'getCounties': function(callback, cityId){
            $http({
                method: 'get',
                url: '/stars/counties?cityId='+ cityId
            }).success(function (data, status, headers, config) {
                callback(data);
                /*
                 *{data:[{id: 1,name: '上海',cityId: 1},{id: 2,name: '北京',cityId: 1}]}
                 */
            }).error(function (data, status, headers, config) {
                $(this).Alert({"title": data.message, "str": data.description, "mark": true});
            });
        },
        'deleteItem': function(callback, id) {
            $http({
                method: 'delete',
                url: '/stars/user?id='+ id
            }).success(function (data, status, headers, config) {
                callback(data);
            }).error(function (data, status, headers, config) {
                $(this).Alert({"title": data.message, "str": data.description, "mark": true});
            });
        },
        'modify': function(callback, id) {
            $http({
                method: 'get',
                url: '/stars/user?id='+ id
            }).success(function (data, status, headers, config) {
                callback(data);
            }).error(function (data, status, headers, config) {
                $(this).Alert({"title": data.message, "str": data.description, "mark": true});
            });
        }
    }
}]);