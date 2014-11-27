(function (angular) {

    angular.module('accodeon', ['ngMaterial', 'ui.ace'])
        .config(function ($sceProvider) {
            $sceProvider.enabled(false);
            // TODO: figure out how to do it better
        })

        .service('filesService', function ($http) {
            // filesService is used here as the bridge between availableFilesCtrl and tabsCtrl
            // TODO rearrange it better
            var tabConstructor = function () {};

            var methods = {
                saveFile: function saveFile(name, user, content) {
                    $http.post('/file', {
                        user: user,
                        name: name,
                        content: content
                    });
                },
                loadFileList: function loadFileList(callback) {
                    $http.get('/file').success(callback);
                },
                registerTabConstructor: function registerTabConstructor(_tabConstructor_) {
                    tabConstructor = _tabConstructor_;
                },
                getFile: function getFile(fileMeta) {
                    $http.get('/file/' + fileMeta.id).success(function (data) {
                        tabConstructor(data, fileMeta);
                    });
                }
            };
            return methods;
        })

        .controller('availableFilesCtrl', function ($scope, $interval, filesService) {
            $scope.availableFiles = [];
            var getFileList = function () {
                filesService.loadFileList(function (fileList) {
                    $scope.availableFiles = fileList;
                });
            };

            $scope.getFile = filesService.getFile;

            $interval(getFileList, 30 * 1000);
            getFileList();
        })

        .controller('tabsCtrl', function ($scope, $http, $q, $mdDialog, $mdSidenav, $interval, filesService) {
            var storedTabs = localStorage.getItem('tabs');
            var tabs;
            if (storedTabs) {
                tabs = JSON.parse(storedTabs);
            } else {
                tabs = [];
            }

            $q.all([
                $http.get('gui/code_eval_template.html'),
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

            $scope.addTab = function (name, content) {
                content = content || name + " Content View";
                tabs.push({name: name, content: content, iframeSrc: 'data:text/plain;utf8,', disabled: false});
            };

            filesService.registerTabConstructor(function (data, fileMeta) {
                $scope.addTab(fileMeta.name, data);
            });

            $scope.removeTab = function (tab) {
                var index = $scope.tabs.indexOf(tab);
                if (index === -1) {
                    throw new Error("Couldn't find tab requested for removal");
                }
                $scope.tabs.splice(index, 0);
            };

            $scope.execCode = function (tab) {
                $scope.saveTabsToLocal();
                if (!$scope.codeTemplate) {
                    console.warn("No code template loaded, cannot exec code");
                    return;
                }
                var userCode = 'function userFunction (console, canvas) {\n' + tab.content + ";}";
                var wholeHtml = $scope.codeTemplate.replace(/\{\{ *USER_CODE *\}\}/, userCode);
                var token = Math.random().toString(36).substring(7);
                wholeHtml = wholeHtml.replace(/\{\{ *RANDOM_TOKEN *\}\}/, token);
                tab.iframeSrc = 'data:text/html;utf8;base64,' + btoa(wholeHtml);
                tab.token = token;
                tab.log = '';
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
                $scope.tabs.forEach(function (tab) {
                    delete tab.token;
                    delete tab.log;
                    delete tab.iframeSrc;
                });
                localStorage.setItem('tabs', JSON.stringify($scope.tabs));
            };

            $interval($scope.saveTabsToLocal, 1000 * 60);

            window.onunload = function () {
                $scope.$apply($scope.saveTabsToLocal);
            };

            window.onmessage = function (e) {
                tabs.forEach(function tabMessage(tab) {
                    if (tab.token == e.data.token) {
                        $scope.$apply(function () {
                            tab.log += e.data.message + '\n';
                        });
                    }
                });
            };

            $scope.saveTab = function (ev) {
                function getCurrentTabContent() {
                    return $scope.tabs[$scope.selectedIndex];
                }
                $mdDialog.show({
                    controller: function ($scope, $mdDialog) {
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.save = function () {
                            var currentTab = getCurrentTabContent();
                            // If title or user is omitted, do nothing.
                            if (!$scope.name || !$scope.user) {
                                return;
                            }
                            $mdDialog.hide();
                            currentTab.name = $scope.name;
                            currentTab.user = $scope.user;
                            filesService.saveFile($scope.name, $scope.user, currentTab.content);
                        };
                    },
                    templateUrl: 'gui/save-dialog.html',
                    targetEvent: ev
                });
            };
        });

})(angular);
