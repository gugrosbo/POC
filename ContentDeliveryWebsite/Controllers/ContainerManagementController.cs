using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ContentDeliveryWebsite.Controllers
{
    public class ContainerManagementController : Controller
    {
        public ActionResult Index(int id = 0)
        {
            if (id == 1)
            {
                return View("AJAX/Index");
            }
            else
            {
                return this.View();
            }
        }

        public ActionResult Start()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult GetAddHostForm()
        {
            return View("AJAX/AddHost");
        }
    }
}