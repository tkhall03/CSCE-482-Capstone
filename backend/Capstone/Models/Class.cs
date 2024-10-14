namespace Capstone.Models
{
    public class Class
    {

        public int Id { get; set; }
        public required int Section {  get; set; }
        public required int CourseRegistrationNumber { get; set; }
        public required DateTime StartDate { get; set; }
        public DateTime ?EndDate { get; set; }
        public required string Schedule { get; set; }
        public required string Time { get; set; }
        public required string CourseRelation { get; set; }

        public ICollection<Person> Persons { get; set; } = new List<Person>();


    }
}
