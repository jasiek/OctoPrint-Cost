/*
 * View model for OctoPrint-Cost
 *
 * Author: Jan Szumiec
 * License: MIT
 */
$(function() {
    function CostViewModel(parameters) {
        var self = this;

        // assign the injected parameters, e.g.:
        // self.loginStateViewModel = parameters[0];
        // self.settingsViewModel = parameters[1];

        // TODO: Implement your plugin's view model here.
    }

    // view model class, parameters for constructor, container to bind to
    OCTOPRINT_VIEWMODELS.push([
        CostViewModel,

        // e.g. loginStateViewModel, settingsViewModel, ...
        [ /* "loginStateViewModel", "settingsViewModel" */ ],

        // e.g. #settings_plugin_cost, #tab_plugin_cost, ...
        [ /* ... */ ]
    ]);
});
