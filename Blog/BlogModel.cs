using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Blog
{
    public class BlogModel
    {
        public List<PostList> GetPostList()
        {
            return dataModel.posts.Select(i => new PostList
            {
                Title = i.title,
                Year = i.date.Year,
                Month = i.date.Month
            }).ToList();
        }

        BlogDataContext dataModel = new BlogDataContext();
    }

    public class PostList
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