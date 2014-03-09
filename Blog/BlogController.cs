using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using System.Linq;
using System.Web.Helpers;
using System.Dynamic;

namespace Blog
{
    public class BlogController : Controller
    {
        public ViewResult Index()
        {
            return View("Index");
        }

        public JsonResult Tree()
        {
            var postInfo = blogModel.GetPostInfo();

            dynamic treeObject = new { name = "Solution Blog", child = new List<dynamic>() };

            postInfo.Select(i => i.Year).Distinct().OrderByDescending(i => i).ToList().ForEach(y =>
            {
                dynamic yearObject = new { name = y, child = new List<dynamic>() };

                postInfo.Where(n => n.Year == y).Select(n => n.Month).Distinct().OrderBy(n => n).ToList().ForEach(m =>
                {
                    postInfo.Where(k => k.Year == y && k.Month == m).Select(k => k.Title).ToList().ForEach(p => yearObject.child.Add(new { name = p }));
                });

                treeObject.child.Add(yearObject);
            });

            return Json(treeObject, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Post()
        {
            return Json("YO!");
        }

        private BlogModel blogModel = new BlogModel();
    }
}