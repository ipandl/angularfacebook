'use strict';

angular.module('angularSocial.facebook', ['ngRoute', 'ngFacebook'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/facebook', {
            templateUrl: 'facebook/facebook.html',
            controller: 'FacebookCtrl'
        });
    }])

.config(function ($facebookProvider) {
    $facebookProvider.setAppId('444238915748899');

    $facebookProvider.setCustomInit({
        version: 'v2.4',
        cookie: true,
        xfbml: true
    });

    $facebookProvider.setPermissions('email,public_profile,user_posts,publish_actions,user_photos');
})

.run(function ($rootScope) {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
})

.controller('FacebookCtrl', ['$scope', '$facebook', function ($scope, $facebook) {
    //initial login to false
    $scope.isLoggedIn = false;

    $scope.login = function () {
        $facebook.login().then(function () {
            $scope.isLoggedIn = true;
            refresh();
        });
    }

    $scope.logout = function () {
        $facebook.logout().then(function () {
            $scope.isLoggedIn = false;
            refresh();
        });
    }

    function refresh() {
        $facebook.api("/me", {
            fields: 'last_name,first_name,email,gender,locale,name,link'
        }).then(function (response) {
                //message above user picture
                $scope.welcomeMsg = "Welcome " + response.name;
                $scope.isLoggedIn = true;
                //data from facebook
                $scope.userInfo = response;
                //get my facebook profile picture
                $facebook.api('/me/picture').then(function (response) {
                    $scope.picture = response.data.url;

                    //get my facebook permissions
                    $facebook.api('/me/permissions').then(function (response) {
                        $scope.permissions = response.data;

                        //get my latest posts from facebook
                        $facebook.api('/me/posts').then(function (response) {
                            $scope.posts = response.data;
                        });
                    });
                });
            },
            function (err) {
                $scope.welcomeMsg = "Please Log In!";
            }
        );
    }
    
    $scope.postStatus = function(){
        var body = this.body;
        
        $facebook.api('/me/feed', 'post', {message:body}).then(function (response) {
            $scope.successPost = "Thanks for Posting!";
            refresh();
            setTimeout(function(){
                $scope.successPost = "";              
            }, 1000);
        });
    }
    
    //initial call
    refresh();
}]);