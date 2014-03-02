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
                Title = i.title,
                Year = i.date.Year,
                Month = i.date.Month
            }).ToList();
        }

        public void Dispose()
        {
            dataModel.Dispose();
        }

        BlogDataContext dataModel = new BlogDataContext();
    }

    public class PostInfo
    {
        /// <summary>
        /// Short title of post
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// Year in which the post was created
        /// </summary>
        public int Year { get; set; }
        /// <summary>
        /// Month in which the post was created
        /// </summary>
        public int Month { get; set; }
    }
}