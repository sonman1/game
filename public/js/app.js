angular.module("gamesApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    games: function(Games) {
                        return Games.getGames();
                    }
                }
            })
            .when("/new/game", {
                controller: "NewGameController",
                templateUrl: "game-form.html"
            })
            .when("/game/:gameId", {
                controller: "EditGameController",
                templateUrl: "game.html"
            })
            .when("/game/:gameId/gamePlay", {
                controller: "GamePlayController",
                templateUrl: "gamePlay.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Games", function($http) {
        this.getGames = function() {
            return $http.get("/games").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding games.");
                });
        }
        this.createGame = function(game) {
            return $http.post("/games", game).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating game.");
                });
        }
        this.getGame = function(gameId) {
            var url = "/games/" + gameId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this game.");
                });
        }
        this.editGame = function(game) {
            var url = "/games/" + game._id;
            console.log(game._id);
            return $http.put(url, game).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this game.");
                    console.log(response);
                });
        }
        this.deleteGame = function(gameId) {
            var url = "/games/" + gameId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this game.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(games, $scope) {
        $scope.games = games.data;
    })
    .controller("NewGameController", function($scope, $location, Games) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveGame = function(game) {
            Games.createGame(game).then(function(doc) {
                var gameUrl = "/game/" + doc.data._id;
                $location.path(gameUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("GamePlayController", function($scope, $location, Games) {
       $scope.logTextArea = "Starting...\n";
        $scope.socket = io();
        $scope.socket.on('time', function(timeString) {
            $scope.$apply(function () {
                $scope.logTextArea += timeString + "\n";
            });
            console.log("msg: " + timeString);
        });

        $scope.sendMsg = function() {
            //socket.emit('time', $scope.message);
            $scope.socket.emit('time', $scope.sendmessage);
        };



    })
    .controller("EditGameController", function($scope, $routeParams, Games) {
        Games.getGame($routeParams.gameId).then(function(doc) {
            $scope.game = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.back = function() {
            $scope.editMode = false;
            $scope.gameFormUrl = "";
        }

        $scope.saveGame = function(game) {
            Games.editGame(game);
            $scope.editMode = false;
            $scope.gameFormUrl = "";
        }

        $scope.deleteGame = function(gameId) {
            Games.deleteGame(gameId);
        }
    });