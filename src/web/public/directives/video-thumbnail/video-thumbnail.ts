/// <reference path="../../../../../typings/tsd.d.ts" />

module Main.Directives.VideoThumbnail {
    class Directive implements ng.IDirective {
        public restrict = 'E';
        public replace = true;
        public scope = {
            youtubeId: '@'
        };
        public templateUrl = 'directives/video-thumbnail/video-thumbnail.html';
    }

    angular.module('main.directives').directive('videoThumbnail', () => new Directive());
}