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
        public JsonResult Post(int id)
        {
            var post = blogModel.GetPostContent(id);

            dynamic postObject = new { text = post.Text, title = post.Title, comments = post.Comments.Select(c => new { text = c.Text }) };

            return Json(postObject, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult Preview(string title, string text)
        {
            dynamic postObject = new { text = text, title = title, comments = new List<Comment>() };

            return Json(postObject);
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult SavePost(string short_title, string title, string text)
        {
            try
            {
                blogModel.SavePost(short_title, title, text);
            }
            catch(Exception e)
            {
                return Json(new { result = false, message = e.Message });
            }

            return Json(new { result = true, message = "" });
        }

        [HttpGet]
        public JsonResult Register(string login, string password)
        {
            try
            {
                if (blogModel.IsUserExist(login, password))
                {
                    return Json(new LoginInfo(false, "", "User already exist"), JsonRequestBehavior.AllowGet);
                }
                else
                {
                    string key = blogModel.AddUser(login, password);

                    return Json(new LoginInfo(true, key, ""), JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                return Json(new LoginInfo(false, "", "Fatal error: " + e.Message), JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult Login(string login, string password)
        {
            try
            {
                if (!blogModel.IsUserExist(login, password))
                {
                    return Json(new LoginInfo(false, "", "No users with name '" + login + "'"), JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new LoginInfo(true, blogModel.GetUserKey(login, password), ""), JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                return Json(new LoginInfo(false, "", "Fatal error: " + e.Message), JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult UserInfo(string key)
        {
            var userInfo = blogModel.GetUserInfo(key);

            return Json(new { name = userInfo.Name, role = userInfo.Role }, JsonRequestBehavior.AllowGet);
        }

        private BlogModel blogModel = new BlogModel();

        class LoginInfo
        {
            public LoginInfo()
            {
                result = false;
                key = "";
                message = "";
            }

            public LoginInfo(bool result, string key, string message = "")
            {
                this.result = result;
                this.key = key;
                this.message = message;
            }

            public bool result
            {
                get;
                set;
            }

            public string key
            {
                get;
                set;
            }

            public string message
            {
                get;
                set;
            }
        }
    }
}