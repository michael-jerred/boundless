/// <reference path="../../../../typings/tsd.d.ts" />

module Main.States {
    class StateConfig {
        static $inject = ['$stateProvider', '$urlMatcherFactoryProvider'];
        constructor(
            $stateProvider: ng.ui.IStateProvider,
            $urlMatcherFactoryProvider: ng.ui.IUrlMatcherFactory) {

            $urlMatcherFactoryProvider.strictMode(false);

            $stateProvider
                .state('root', {
                    abstract: true,
                    views: {

                    }
                })
                .state('root.search', { url: '/search', views: { '': '' } })
                .state('root.playlists', {})
                .state('root.search', {})
                .state('root.search', {})
                .state('root.search', {});
        }
    }

    angular.module('main.states').config(StateConfig);
}