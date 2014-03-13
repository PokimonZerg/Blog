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
        [HttpGet]
        public ViewResult Index()
        {
            return View("Index");
        }

        [HttpGet]
        public JsonResult Tree()
        {
            var postInfo = blogModel.GetPostInfo();

            dynamic treeObject = new { name = "Solution Blog", child = new List<dynamic>() };

            postInfo.Select(i => i.Year).Distinct().OrderByDescending(i => i).ToList().ForEach(y =>
            {
                dynamic yearObject = new { name = y, child = new List<dynamic>() };

                postInfo.Where(n => n.Year == y).ToList().ForEach(p => yearObject.child.Add(new { name = p.Title, id = p.Id }));

                treeObject.child.Add(yearObject);
            });

            return Json(treeObject, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult Post(int id)
        {
            var post = blogModel.GetPostContent(id);

            string html = "<span class=\"post-keyword\">namespace</span> Blog<br />" +
                          "{" +
                              "<div style=\"margin-left: 24px;\">" +
                              "<span class=\"post-keyword\">class</span> <header>" + "no title" + "</header><br />" +
                              "{" +
                                  "<div style=\"margin-left: 48px;\">" + post.Text + "</div>" +
                              "}" +
                              "</div>";

            foreach (var c in post.Comments)
            {
                html += "<br />" +
                        "<div style=\"margin-left: 24px;\">" +
                        "<span class=\"post-keyword\">class</span> <header>Comment</header><br />" +
                        "{" +
                            "<div style=\"margin-left: 48px;\">" + c.Text + "</div>" +
                        "}" +
                        "</div>";
            }

            html += "}";

            return Content(html, "text/html");
        }

        private BlogModel blogModel = new BlogModel();
    }
}