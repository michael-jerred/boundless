/// <reference path="../../../../../typings/tsd.d.ts" />

module Main.States {
    class StateConfig {
        static $inject = ['$stateProvider'];
        constructor(
            $stateProvider: ng.ui.IStateProvider) {

            $stateProvider
                .state('main', { abstract: true, templateUrl: 'states/main/main-layout.html' })
                .state('main.home', {
                    url: '',
                    views: {
                        'header': ,
                        'sub': ,
                        'main': ,
                        'footer' ,
                    }
                })
                .state('main.search', {
                    url: '/search',
                    views: {
                        'header': ,
                        'sub': ,
                        'main': ,
                        'footer' ,
                    }
                });
        }
    }

    angular.module('main.states').config(StateConfig);
}