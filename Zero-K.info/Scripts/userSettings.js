﻿function loadModules() {

    // arrange modules in order set by user
    var moduleOrder = $.cookie("moduleOrder");
    console.log("module order", moduleOrder);
    if (moduleOrder != null && moduleOrder != "" && moduleOrder != "null") {
        //var modules = JSON.parse(moduleOrder);
        var modules = moduleOrder.split(",");
        console.log("loading modules", modules);

        // TODO: support multiple columns

        // insert modules in order
        for (var i = 1; i < modules.length; i++) {
            $("#" + modules[i]).insertAfter("#" + modules[i - 1]);
        }
    }

    // initialize ability to sort modules dynamically
    console.log("init module sorting");
    $(".module-column").sortable({
        connectWith: ".module-column",
        placeholder: "module-placeholder",
        stop: saveModules
    });

    // ensure elements don't have dangly floats
    $(".module").append("<br style='display: block; clear: both;' />");

    return true;
}

function saveModules() {
    // TODO: support multiple columns

    // save module order from user in cookie
    var moduleOrder = $(".module-column").sortable("toArray");
    console.log("saving module order", moduleOrder);
    $.cookie("moduleOrder", moduleOrder);

    return true;
}

function loadTheme() {
    var themeColor = $.cookie("themeColor");
    console.log("loading theme", themeColor);
    if (!themeColor) return false;
    less.modifyVars({ "highlight": themeColor });
    less.refreshStyles();
}

function setTheme(color) {
    console.log("setting theme color", color);

    // determine color value from argument
    var themeColor;
    switch (color) {
        case "red": themeColor = "rgba(200,0,0,1)"; break;
        default: themeColor = "rgba(250,250,250,1)"; break;
    }

    // apply theme to site
    less.modifyVars({ "highlight": themeColor });
    less.refreshStyles();

    // save theme
    $.cookie("themeColor", themeColor);

    return true;
}

function clearCookies() {
    $.cookie("themeColor", null);
    $.cookie("moduleOrder", null);
}

$(function () {
    loadTheme();
    loadModules();
});