using Capstone.Models;

namespace Capstone.Services
{
    public class PersonService : IPersonService
    {

        public Task<Class[]> GetClassesPerTermAsync()
        {
            var classEntity = new Class { 
                Id = 1,
                Section = 100,
                CourseRegistrationNumber = 1,
                StartDate = DateTime.Now,
                EndDate = null,
                Schedule = "some schedule",
                Time = "12:00pm",
                CourseRelation = "some relation",
                Persons =
                {
                    new Person{Id = 1, Name = "Dyllen Faustin" }
                }
            };

            return Task.FromResult(new Class[] { classEntity });
        }
    }
}
