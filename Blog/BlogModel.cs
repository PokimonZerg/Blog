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
                Title = i.title,
                Year = i.date.Year,
            }).ToList();
        }

        public PostContent GetPostContent(int id)
        {
            return new PostContent()
            {
                Text = dataModel.posts.First(t => (int)t.id == id).text,
                Comments = dataModel.comments.Join(dataModel.posts, c => c.post, p => p.id, (c, p) => new Comment() { 
                    Text = c.text, 
                    Author = "author", 
                    Date = new DateTime() 
                }).ToList()
            };
        }

        public void Dispose()
        {
            dataModel.Dispose();
        }

        BlogDataContext dataModel = new BlogDataContext();
    }

    public class PostContent
    {
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