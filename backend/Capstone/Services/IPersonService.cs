using Capstone.Models;

namespace Capstone.Services
{
    public interface IPersonService
    {

        Task<Class[]> GetClassesPerTermAsync();

        Task<Person> GetPersonByIdAsync(int id);
    }
}
