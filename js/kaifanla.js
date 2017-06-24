/**
 * Created by bjwsl-001 on 2017/5/22.
 */
var app = angular.module('kaifanla', ['ionic']);

//配置状态
app.config(function ($stateProvider, $urlRouterProvider,
                     $ionicConfigProvider) {
    //将选项卡固定在页面底部（Android默认在上边）
    $ionicConfigProvider.tabs.position('bottom');
    $stateProvider
        .state('start', {
            templateUrl: 'tpl/start.html',
            url: '/kflStart'
        })
        .state('main', {
            templateUrl: 'tpl/main.html',
            url: '/kflMain',
            controller:'mainCtrl'
        })
        .state('detail', {
            templateUrl: 'tpl/detail.html',
            url: '/kflDetail/:id',
            controller:'detailCtrl'
        })
        .state('order', {
            templateUrl: 'tpl/order.html',
            url: '/kflOrder/:id',
            controller:'orderCtrl'
        })
        .state('myOrder', {
            templateUrl: 'tpl/myOrder.html',
            url: '/kflMyOrder',
            controller:'myorderCtrl'
        })
        .state('set', {
            templateUrl: 'tpl/set.html',
            url: '/kflSet',
            controller:'setCtrl'
        })
        .state('cart', {
            templateUrl: 'tpl/cart.html',
            url: '/kflCart',
            controller:'cartCtrl'
        });
    $urlRouterProvider.otherwise('/kflStart');
})

//创建父控制器
app.controller('parentCtrl', ['$scope', '$state',
    function ($scope, $state) {
        $scope.jump = function (desState, params) {
            $state.go(desState, params);
        }
    }
]);


//创建mainCtrl控制器
app.controller('mainCtrl', ['$scope', '$http',
    function ($scope, $http) {
        //是否有更多数据可以加载
        $scope.hasMore = true;

        //发起网络请求，初始化一些数据
        $http
            .get('data/dish_getbypage.php?start=0')
            .success(function (data) {
                console.log(data);
                $scope.dishList = data;
            });
        //加载更多的方法
        $scope.loadMore = function () {
            $http.get('data/dish_getbypage.php?start='+$scope.dishList.length)
                .success(function (data) {
                    if(data.length < 5)
                    {
                        $scope.hasMore = false;
                    }
                    $scope.dishList = $scope.dishList.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
        }
        //监听用户的输入 搜索 将结果显示出来
        $scope.inputTxt = {kw:''};
        $scope.$watch('inputTxt.kw', function () {
            if($scope.inputTxt.kw.length>0)
            {
                $http.get('data/dish_getbykw.php?kw='+$scope.inputTxt.kw)
                    .success(function (data) {
                        if(data.length>0)
                        {
                            $scope.dishList = data;
                        }
                    })
            }
        })
    }
])
//detail控制器
app.controller('detailCtrl',['$scope','$stateParams','$http','$ionicPopup',
    function ($scope,$stateParams,$http,$ionicPopup){
        console.log($stateParams);
        var did = $stateParams.id;
        $http.get('data/dish_getbyid.php?id='+did)
            .success(function (data) {
                console.log(data);
                $scope.dish = data[0];
            })
        $scope.addcart=function(){
            $http.get('data/cart_update.php?uid=1&did='+did+'&count=-1')
                .success(function(data){
                    console.log(data);
                    if(data.msg==='succ'){
                        $ionicPopup.alert({
                            template:'添加成功'
                        });
                    }
                    else{
                        $ionicPopup.alert({
                            template:'添加失败'
                        });
                    }
                })
        }
    }
]);
//order控制器
app.controller('orderCtrl',['$scope','$http','$stateParams','$httpParamSerializerJQLike',
    function ($scope,$http,$stateParams,$httpParamSerializerJQLike) {
        console.log($stateParams.id);
        $scope.orderInfo = {
            did:$stateParams.id,
            user_name:'',
            sex:1,
            addr:'',
            phone:''
        };
        $scope.submitOrder = function () {
            var str = $httpParamSerializerJQLike($scope.orderInfo);
            console.log(str);
            $http.get('data/order_add.php?'+str)
                .success(function (data) {
                //  根据服务器返回的结果对表单处理
                    if(data.length > 0)
                    {
                        if(data[0].msg == 'succ')
                        {
                            $scope.result = "下单成功，订单编号为"+data[0].oid;
                            //将手机号存在本地，作为识别当前用户的标识
                            sessionStorage.setItem('phone',$scope.orderInfo.phone);
                        }
                        else
                        {
                            $scope.result = "下单失败";
                        }
                    }

                })

        }

    }
]);
//myorder控制器
app.controller('myorderCtrl',['$scope','$http',function($scope,$http){
    var phone=sessionStorage.getItem('phone');
    console.log(phone);
    $http.get('data/order_getbyphone.php?phone='+phone).success(function(data){
        console.log(data);
        $scope.orderlist=data;
    });
}]);
//set控制器
app.controller('setCtrl',['$scope','$ionicModal',function($scope,$ionicModal){
    //得到模态框对应的实例
    $ionicModal.fromTemplateUrl('tpl/about.html',{
        scope:$scope
    })
        .then(function(data){
            $scope.modal=data;
        });

    //通过$ionicModal显示一个自定义模态框
    $scope.show=function(){
        $scope.modal.show()
    };
    //关闭模态框
    $scope.hide=function(){
        $scope.modal.hide()
    }
}]);





