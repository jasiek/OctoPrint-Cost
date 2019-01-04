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

	settingsState.check_cost = ko.observable(true);

	settingsState.costPerWeight = ko.pureComputed(function() {
        var currency = settingsState.settings.plugins.cost.currency();
        var weight = settingsState.settings.plugins.cost.weight();
        return currency + '/' + weight;
	});
	settingsState.costPerLength = ko.pureComputed(function() {
        var currency = settingsState.settings.plugins.cost.currency();
        var length = settingsState.settings.plugins.cost.length();
        return currency + '/' + length;
	});
	settingsState.costPerTime = ko.pureComputed(function() {
        var currency = settingsState.settings.plugins.cost.currency();
        var time = settingsState.settings.plugins.cost.time();
        return currency + '/' + time;
	});

        printerState.costString = ko.pureComputed(function() {
            if (settingsState.settings === undefined) return '-';
            if (printerState.filament().length == 0) return '-';

            var currency = settingsState.settings.plugins.cost.currency();
            var cost_per_length = settingsState.settings.plugins.cost.cost_per_length();
            var cost_per_weight = settingsState.settings.plugins.cost.cost_per_weight();
            var density_of_filament = settingsState.settings.plugins.cost.density_of_filament();
            var cost_per_time = settingsState.settings.plugins.cost.cost_per_time();

            var filament_used_length = printerState.filament()[0].data().length / 1000;
            var filament_used_volume = printerState.filament()[0].data().volume / 1000;
            var expected_time = (printerState.printTime() + printerState.printTimeLeft()) / 3600;

            if (settingsState.check_cost()) {
                var totalCost = cost_per_weight * filament_used_volume * density_of_filament + expected_time * cost_per_time;
            } else {
                var totalCost = cost_per_length * filament_used_length + expected_time * cost_per_time;
            }

            return '' + currency + totalCost.toFixed(2);
        });

        var originalGetAdditionalData = filesState.getAdditionalData;
        filesState.getAdditionalData = function(data) {
            var output = originalGetAdditionalData(data);

            if (data.hasOwnProperty('gcodeAnalysis')) {
                var gcode = data.gcodeAnalysis;
                if (gcode.hasOwnProperty('filament') && gcode.filament.hasOwnProperty('tool0') && gcode.hasOwnProperty('estimatedPrintTime')) {
                    var currency = settingsState.settings.plugins.cost.currency();
                    var cost_per_length = settingsState.settings.plugins.cost.cost_per_length();
                    var cost_per_weight = settingsState.settings.plugins.cost.cost_per_weight();
                    var density_of_filament = settingsState.settings.plugins.cost.density_of_filament();
                    var cost_per_time = settingsState.settings.plugins.cost.cost_per_time();
                    var filament_used_length = gcode.filament.tool0.length / 1000;
                    var filament_used_volume = gcode.filament.tool0.volume / 1000;

                    // Use last print time instead of estimation for prints that are already printed at least once
                    if (data["prints"] && data["prints"]["last"] && data["prints"]["last"]["printTime"]) {
                        var expected_time = data["prints"]["last"]["printTime"] / 3600;
                    } else {
                        var expected_time = gcode.estimatedPrintTime / 3600;
                    }

                    if (settingsState.check_cost()) {
                        var totalCost = cost_per_weight * filament_used_volume * density_of_filament + expected_time * cost_per_time;
                    } else {
                        var totalCost = cost_per_length * filament_used_length + expected_time * cost_per_time;
                    }

                    // Build different output string for first time prints (the octoprint frontend adds a new line or not depending on this. A bug?)
                    if (data["prints"] && data["prints"]["last"] && data["prints"]["last"]["printTime"]) {
                        output += "<br>" + gettext("Cost") + ": " + currency + totalCost.toFixed(2);
                    } else {
                        output += gettext("Cost") + ": " + currency + totalCost.toFixed(2);
                    }
                }
            }

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
