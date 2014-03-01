using System;
using System.Web;
using System.Web.Mvc;

namespace Blog
{
    public class BlogController : Controller
    {
        public ViewResult Index()
        {
            //BlogModel model = new BlogModel();

            //var posts = model.GetPostList();

            return View("Index");
        }
    }
}