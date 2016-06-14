/*
 * View model for OctoPrint-Cost
 *
 * Author: Jan Szumiec
 * License: MIT
 */
$(function() {
    function CostViewModel(parameters) {
        var printerState = parameters[0];
        var settingsState = parameters[1];
        var filesState = parameters[2];
        var self = this;

        // There must be a nicer way of doing this.
        printerState.costString = ko.pureComputed(function() {
            if (settingsState.settings === undefined) return '-';
            if (printerState.filament().length == 0) return '-';
            
            var currency = settingsState.settings.plugins.cost.currency();
            var cost_per_meter = settingsState.settings.plugins.cost.cost_per_meter();
            var cost_per_hour = settingsState.settings.plugins.cost.cost_per_hour();

            var filament_used_meters = printerState.filament()[0].data().length / 1000;
            var expected_time_hours = printerState.estimatedPrintTime() / 3600;

            var totalCost = cost_per_meter * filament_used_meters + expected_time_hours * cost_per_hour;
            
            return '' + currency + totalCost.toFixed(2);
        });

        var originalGetAdditionalData = filesState.getAdditionalData;
        filesState.getAdditionalData = function(data) {
            var output = originalGetAdditionalData(data);

            var currency = settingsState.settings.plugins.cost.currency();
            var cost_per_meter = settingsState.settings.plugins.cost.cost_per_meter();
            var cost_per_hour = settingsState.settings.plugins.cost.cost_per_hour();

            var filament_used_meters = data["gcodeAnalysis"]["filament"]["tool0"].length / 1000;
            var expected_time_hours = data["gcodeAnalysis"]["estimatedPrintTime"] / 3600;

            var totalCost = cost_per_meter * filament_used_meters + expected_time_hours * cost_per_hour;

            output += gettext("Cost") + ": " + currency + totalCost.toFixed(2);;
            return output;
        };
        
        self.onStartup = function() {
            var element = $("#state").find(".accordion-inner .progress");
            if (element.length) {
                var text = gettext("Cost");
                element.before(text + ": <strong data-bind='text: costString'></strong><br>");
            }
        };

    }

    // view model class, parameters for constructor, container to bind to
    OCTOPRINT_VIEWMODELS.push([
        CostViewModel,
        ["printerStateViewModel", "settingsViewModel", "gcodeFilesViewModel"],
        []
    ]);
});
