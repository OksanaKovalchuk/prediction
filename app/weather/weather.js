'use strict';

angular.module('app.weather', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'weather/weather.html',
            controller: MainCtrl
        });
    }]);

    function MainCtrl($scope) {
        $scope.weatherList=[];
        $scope.showLocal=false;
        $scope.weatherLocal=[];
        jQuery.support.cors = true;
        /**
         *function for searching weather due to input
         * @param str
         */
        function getForeCast(str){
            var xhr = new XMLHttpRequest();
            xhr.open(
                "get",
                "http://api.openweathermap.org/data/2.5/"+str+"&APPID=b144e1fa3899aabd026cd3b5edb95402",
                true);
            xhr.onreadystatechange =function(){
                if(xhr.readyState==4){
                    var status=xhr.status;
                    if((status>=200 && status<300)|| status==304){

                           $scope.showBoolean = true;
                           $scope.weatherList= JSON.parse(xhr.responseText);
                    }
                    else{
                        alert("cannot get answer");
                    }
                }
            };
            xhr.send();
        }

        /**
         *fuction for readinf current input
         */
        $scope.$watch('citychange', function(){
            if($scope.citychange){
                getForeCast("weather?q=="+$scope.citychange);
            }
        },true);
        /**
         * function to get weather due to location
         */
        $scope.geoFindMe = function() {
            var output = document.getElementById("local");
            if (!navigator.geolocation){
                output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
                return;
            }
            function success(position) {
                var latitude  = position.coords.latitude;
                var longitude = position.coords.longitude;
                $scope.coords=[latitude,longitude];
                if($scope.coords){
                    var xhr = new XMLHttpRequest();
                    xhr.open(
                        "get",
                        "http://api.openweathermap.org/data/2.5/forecast?lat="+$scope.coords[0]+'&lon='+
                        $scope.coords[1]+"&APPID=c108e430cb627416aaf1c2807a944e25",
                        true);
                    xhr.onreadystatechange =function(){

                        if(xhr.readyState==4){
                            var status=xhr.status;
                            if((status>=200 && status<300)|| status==304){
                                $scope.showLocal = true;
                                $scope.weatherLocal= JSON.parse(xhr.responseText);
                                var city = new XMLHttpRequest();
                                city.open(
                                    "get",
                                    "http://api.openweathermap.org/data/2.5/weather?q=="+$scope.weatherLocal.city.name
                                    +"&APPID=d2169ee886ec75bc33a2d0a62b777ef5",
                                    true
                                );
                                city.onreadystatechange=function() {
                                    if (city.readyState == 4) {
                                        var citystatus = city.status;
                                        if ((citystatus >= 200 && citystatus < 300) || citystatus == 304) {
                                            $scope.new = JSON.parse(city.responseText);
                                            output.innerHTML =
                                                "<div ng-show='showLocal' class='container-fluid'> <p>" +
                                                $scope.new.name + ",  " +
                                                $scope.new.sys.country+": "+($scope.new.main.temp - 273.15)+ "&#176; C, "
                                            +$scope.new.weather[0].description+"</p></div>";
                                        }
                                    }
                                };
                                city.send();
                            }
                            else{
                                alert("cannot get answer");
                            }
                        }
                    };
                    xhr.send();
                }
            }
            function error() {
                output.innerHTML = "Unable to get your location";
            }
            navigator.geolocation.getCurrentPosition(success, error);
        };
        $(document).ready(function () {
            $scope.geoFindMe();
        });
    }