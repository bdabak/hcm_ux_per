/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/thy/ux/per/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});