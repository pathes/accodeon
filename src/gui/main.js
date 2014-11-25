(function (angular) {

    angular.module('accodeon', ['ngMaterial', 'ui.ace'])

        .controller('availableFilesCtrl', function ($scope) {
            var availableFilesMock = [
                'foo',
                'bar',
                'baz'
            ];
            $scope.availableFiles = availableFilesMock;
        })

        .controller('tabsCtrl', function ($scope) {
            var tabs = [
                {title: 'One', content: "Tabs will become paginated if there isn't enough room for them."},
                {title: 'Two', content: "You can swipe left and right on a mobile device to change tabs."},
                {
                    title: 'Three',
                    content: "You can bind the selected tab via the selected attribute on the md-tabs element."
                },
                {title: 'Four', content: "If you set the selected tab binding to -1, it will leave no tab selected."},
                {title: 'Five', content: "If you remove a tab, it will try to select a new one."},
                {
                    title: 'Six',
                    content: "There's an ink bar that follows the selected tab, you can turn it off if you want.",
                },
                {
                    title: 'Seven',
                    content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab."
                },
                {
                    title: 'Eight',
                    content: "If you look at the source, you're using tabs to look at a demo for tabs. Recursion!"
                },
                {
                    title: 'Nine',
                    content: "If you set md-theme=\"green\" on the md-tabs element, you'll get green tabs."
                },
                {
                    title: 'Ten',
                    content: "If you're still reading this, you should just go check out the API docs for tabs!"
                }
            ];

            $scope.selectedIndex = 2;
            $scope.tabs = tabs;

            $scope.announceSelected = function (tab) {
                console.log("select tab", $scope.tabs.indexOf(tab));
            };

            $scope.announceDeselected = function (tab) {
                console.log("deselected tab", $scope.tabs.indexOf(tab));
            };

            $scope.addTab = function (title, view) {
                view = view || title + " Content View";
                tabs.push({title: title, content: view, disabled: false});
            };

            $scope.removeTab = function (tab) {
                var index = $scope.tabs.indexOf(tab);
                if (index === -1) {
                    throw new Error("Couldn't find tab requested for removal");
                }
                $scope.tabs.splice(index, 0);
            };

            $scope.aceLoaded = function(editor) {
                // TODO: configure editor
            };
        });

})(angular);
