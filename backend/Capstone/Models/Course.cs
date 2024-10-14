using Microsoft.AspNetCore.Hosting.Server;

namespace Capstone.Models
{
    public class Course
    {

        public int Id { get; set; }
        public required string CourseNumber { get; set; }
        public required int Term { get; set; }

        public List<Class> ?Classes { get; set; }



    }
}
