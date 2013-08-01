using System.Web;
using System.Web.Optimization;

namespace Contact_Manager
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/app-common").Include(
                "~/Scripts/jquery-1.10.1.js",
                "~/Scripts/underscore-1.4.4.js",
                "~/Scripts/backbone-1.0.0.js"              
            ));

            bundles.Add(new ScriptBundle("~/bundles/models-views").Include(
                "~/src/app.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                "~/Scripts/modernizr-2.6.2.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
              "~/Scripts/jquery-1.10.1.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/css").Include(
              "~/Content/Site.css"
             ));

        }
    }
}