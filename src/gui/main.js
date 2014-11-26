(function (angular) {

    angular.module('accodeon', ['ngMaterial', 'ui.ace'])
        .config(function ($sceProvider) {
            $sceProvider.enabled(false);
            // TODO: figure out how to do it better
        })

        .controller('availableFilesCtrl', function ($scope) {
            var availableFilesMock = [
                {
                    name: 'foo',
                    author: 'Krupiński',
                    date: new Date('2014-11-25T14:00:00.000Z')
                },
                {
                    name: 'bar',
                    author: 'Gumiela',
                    date: new Date('2014-11-22T11:00:00.000Z')
                }
            ];
            $scope.availableFiles = availableFilesMock;
        })
        
        .controller('tabsCtrl', function ($scope, $http, $q, $mdSidenav, $interval) {
            var tabs = localStorage.getItem('tabs');
            if (tabs) {
                tabs = JSON.parse(tabs);
            } else {
                tabs = [
                    {
                        title: 'One',
                        code: 'console.log("Tab 1");',
                        iframeSrc: 'data:text/plain;utf8,Code result 1'
                    },
                    {
                        title: 'Two',
                        code: 'console.log("Tab 2");',
                        iframeSrc: 'data:text/plain;utf8,Code result 2'
                    },
                ];
            }

            $q.all([
                $http.get('code_template'),
                $http.get('gui/code_eval_library.js')
            ]).then (function (codes) {
                $scope.codeTemplate = codes[0].data.replace(/\{\{ *LIBRARY *\}\}/, codes[1].data);
            });

            $scope.codeTemplate = null;
            $scope.selectedIndex = 0;
            $scope.tabs = tabs;

            $scope.announceSelected = function (tab) {
                console.log("select tab", $scope.tabs.indexOf(tab));
            };

            $scope.announceDeselected = function (tab) {
                console.log("deselected tab", $scope.tabs.indexOf(tab));
            };

            $scope.addTab = function (title, view) {
                view = view || title + " Content View";
                tabs.push({title: title, code: view, iframeSrc: 'data:text/plain;utf8,Code result', disabled: false});
            };

            $scope.removeTab = function (tab) {
                var index = $scope.tabs.indexOf(tab);
                if (index === -1) {
                    throw new Error("Couldn't find tab requested for removal");
                }
                $scope.tabs.splice(index, 0);
            };

            $scope.execCode = function (tab) {
                $scope.saveTabsToLocal();
                if ($scope.codeTemplate === null) {
                    console.warning("No code template loaded, cannot exec code");
                    return;
                }
                var userCode = 'function userFunction (console, canvas) {\n' + tab.code + ";}";
                var wholeHtml = $scope.codeTemplate.replace(/\{\{ *USER_CODE *\}\}/, userCode);
                wholeHtml = wholeHtml.replace(/\{\{ *RANDOM_TOKEN *\}\}/, Math.random().toString(36).substring(7));
                tab.iframeSrc = 'data:text/html;utf8;base64,' + btoa(wholeHtml);
            };

            $scope.aceLoaded = function(editor) {
                editor.commands.addCommand({
                    name: "execjs",
                    bindKey: {
                        win: "Ctrl-Enter",
                        mac: "Command-Enter"
                    },
                    exec: function(editor) {
                        $scope.$apply(function() {
                            $scope.execCode($scope.tabs[$scope.selectedIndex]);
                        });
                    },
                    readOnly: true
                });
            };

            $scope.toggleAvailableFiles = function () {
                $mdSidenav('available-files').toggle();
            };

            $scope.saveTabsToLocal = function () {
                localStorage.setItem("tabs", JSON.stringify($scope.tabs));
            };

            $interval($scope.saveTabsToLocal, 1000 * 60);

            window.onunload = function () {
                $scope.$apply($scope.saveTabsToLocal);
            };
        });

})(angular);
