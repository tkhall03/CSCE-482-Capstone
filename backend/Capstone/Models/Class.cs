namespace Capstone.Models
{
    public class Class
    {

        public int Id { get; set; }
        public required int Section {  get; set; }
        public required int CourseRegistrationNumber { get; set; }

        public required string Schedule { get; set; }
        public required string Time { get; set; }
        public string ?CourseRelation { get; set; }
        public required int TermId { get; set; }

        public ICollection<Person> Persons { get; set; } = new List<Person>();


    }
}
