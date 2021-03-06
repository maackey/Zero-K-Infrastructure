﻿using System.Web.Optimization;

public class BundleConfig
{
    public static void RegisterBundles(BundleCollection bundles)
    {
        bundles.Add(new ScriptBundle("~/bundles/main").Include(
            "~/Scripts/jquery-{version}.js",
            "~/Scripts/jquery.unobtrusive-ajax.js",
            "~/Scripts/browser-css.js",
            "~/Content/jquery-ui-1.12.1/jquery-ui.min.js",
            "~/Scripts/jquery.ui.stars.js",
            "~/Scripts/jquery.qtip.min.js",
            "~/Scripts/jquery.ba-bbq.js",
            "~/Scripts/jquery.history.js",
            "~/Scripts/jquery.expand.js",
            "~/Scripts/jquery.datetimepicker.full.min.js",
            "~/Scripts/jquery.cookie.js",
            "~/Scripts/less-1.5.1.min.js",
            "~/Scripts/nicetitle.js",
            "~/Scripts/raphael-min.js",
            "~/Scripts/grid.js",
            "~/Scripts/site_main.js",
            "~/Scripts/userSettings.js",
            "~/Scripts/GoogleAnalytics.js"
            ));

        bundles.Add(new StyleBundle("~/bundles/maincss").Include(
            "~/Styles/fonts.css",
            "~/Styles/base.css",
            "~/Styles/jquery.datetimepicker.min.css",
            "~/Styles/menu.css",
            "~/Styles/stars.css",
            "~/Styles/levelrank.css",
            "~/Styles/jquery.ui.stars.css",
            "~/Styles/style.css",
            "~/Styles/jquery.qtip.min.css",
            "~/Styles/dark-hive/jquery-ui.css",
            "~/Styles/nicetitle.css",
            "~/Content/font-awesome.min.css"
            //"~/Content/jquery-ui-1.12.1/jquery-ui.min.css"
            ));

        
    }
}