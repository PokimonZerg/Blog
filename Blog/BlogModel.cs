using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Blog
{
    public sealed class BlogModel : IDisposable
    {
        public List<PostInfo> GetPostInfo()
        {
            return dataModel.posts.Select(i => new PostInfo
            {
                Id = i.id,
                Title = i.short_title,
                Year = i.date.Year,
            }).ToList();
        }

        public PostContent GetPostContent(int id)
        {
            return dataModel.posts.Where(p => (int)p.id == id).Select(s => new PostContent() {
                ShortTitle = s.short_title,
                Title = s.title,
                Text = s.text,

                Comments = dataModel.comments.Where(c => c.post == id).Select(c => new Comment() { 
                    Text = c.text, 
                    Author = "author", 
                    Date = new DateTime() 
                }).ToList()
            }).First();
        }

        public void SavePost(string short_title, string title, string text)
        {
            dataModel.posts.InsertOnSubmit(new post { short_title = short_title, title = title, text = text, date = DateTime.Now });

            dataModel.SubmitChanges();
        }

        public bool IsUserExist(string login, string password)
        {
            return dataModel.users.Where(u => u.login.Equals(login) && u.password.Equals(password)).Count() != 0;
        }

        public string GetUserKey(string login, string password)
        {
            return dataModel.users.Where(u => u.login.Equals(login) && u.password.Equals(password)).First().key;
        }

        public void CheckUserRole(string[] roles, string key)
        {
            var role = dataModel.users.First(u => u.key.Equals(key)).role;

            foreach (var r in roles)
                if (r == role) return;

            throw new Exception("Security alert! User role must be " + (roles.Length > 1 ? "<SPLIT>" : roles[0]));
        }

        public UserInfo GetUserInfo(string key)
        {
            return dataModel.users.Where(u => u.key.Equals(key)).Select(f => new UserInfo { Name = f.login, Role = f.role }).First();
        }

        public string AddUser(string login, string password)
        {
            string newKey = Guid.NewGuid().ToString();

            dataModel.users.InsertOnSubmit(new user {
                login = login,
                password = password,
                token = null,
                key = newKey,
                role = "user" 
            });

            dataModel.SubmitChanges();

            return newKey;
        }

        public void Dispose()
        {
            dataModel.Dispose();
        }

        BlogDataContext dataModel = new BlogDataContext();
    }

    public class UserInfo
    {
        /// <summary>
        /// User name (login)
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// User role (admin, user)
        /// </summary>
        public string Role { get; set; }
    }

    public class PostContent
    {
        /// <summary>
        /// Short title
        /// </summary>
        public string ShortTitle { get; set; }

        /// <summary>
        /// Post title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Text content of the post
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Post comments
        /// </summary>
        public List<Comment> Comments { get; set; }
    }

    public class Comment
    {
        /// <summary>
        /// Comment content
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Comment creation date
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Coment author
        /// </summary>
        public string Author { get; set; }
    }

    public class PostInfo
    {
        /// <summary>
        /// Unique post id
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Short title of post
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Year in which the post was created
        /// </summary>
        public int Year { get; set; }
    }
}