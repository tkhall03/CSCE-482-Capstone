using Capstone.Models;

namespace Capstone.Services
{
    public interface IPersonService
    {

        Task<List<Class>> GetClassesPerTermAsync(int personId);

        Task<Person> GetPersonByIdAsync(int id);
    }
}
