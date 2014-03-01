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
            var postInfo = blogModel.GetPostInfo();

            dynamic treeObject = new DynamicJsonObject(new Dictionary<string, object> { 
                { "name", "SolutionBlog" },
                { "child", new List<dynamic>() }
            });

            postInfo.Select(i => i.Year).Distinct().OrderByDescending(i => i).ToList().ForEach(y => {

                var months = postInfo.Where(n => n.Year == y).Select(n => n.Month).Distinct().OrderBy(n => n).ToList();

                dynamic yearObject = new DynamicJsonObject(new Dictionary<string, object> { 
                    { "name", y },
                    { "child", new List<dynamic>() }
                });

                treeObject.child.Add(yearObject);
            });


            string json = System.Web.Helpers.Json.Encode(treeObject);

            return View("Index");
        }

        private BlogModel blogModel = new BlogModel();
    }
}