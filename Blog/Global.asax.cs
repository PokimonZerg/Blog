using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Blog
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            ViewEngines.Engines.Clear();
            ViewEngines.Engines.Add(new BlogViewEngine());

            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }
    }

    /// <summary>
    /// Custom view engine for using custom view folders
    /// </summary>
    public class BlogViewEngine : RazorViewEngine
    {
        public BlogViewEngine()
        {
            ViewLocationFormats = new[] { "~/{0}.cshtml" };
        }
    }

    /// <summary>
    /// Basic routers config
    /// </summary>
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Blog", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
