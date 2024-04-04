using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Threading;
using System.Globalization;

namespace Clinic
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

        /*session 57: change language*/
        protected void Application_BeginRequest()
        {
            if(Request.Cookies["lang"] != null)
            {
                if(Request.Cookies["lang"].Value != null)
                {
                    string lng = Request.Cookies["lang"].Value.ToString();
                    Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(lng);
                    Thread.CurrentThread.CurrentUICulture = new CultureInfo(lng);
                }
            }
        }
    }
}
