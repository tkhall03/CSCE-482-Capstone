namespace Capstone.Models
{
    public class Person
    {

        public int Id { get; set; }
        public required string Name { get; set; }

        public ICollection<Class> Classes { get; set; } = new List<Class>();
    }
}
