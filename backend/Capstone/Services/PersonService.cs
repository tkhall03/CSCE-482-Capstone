using Capstone.Data;
using Capstone.Models;
using Microsoft.EntityFrameworkCore;

namespace Capstone.Services
{
    public class PersonService : IPersonService
    {

        private readonly SeaAggieCorpContext _context;
        public PersonService(SeaAggieCorpContext context) { 
        
            _context = context;
        }

        public async Task<List<Class>> GetClassesPerTermAsync(int personId)
        {
            var classes = await _context.Persons.Where(p => p.Id == personId).SelectMany(p => p.Classes).ToListAsync();

            return classes;
           
        }

        public async Task<Person> GetPersonByIdAsync(int personId)
        {
            var person = await _context.Persons.FirstOrDefaultAsync(x => x.Id == personId);
            return person;
        }
    }
}
