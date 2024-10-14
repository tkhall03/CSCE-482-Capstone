using Capstone.Services;
using Microsoft.AspNetCore.Mvc;

namespace Capstone.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonController : ControllerBase
    {
        private readonly IPersonService _personService;

        public PersonController(IPersonService personService)
        {
            _personService = personService;
        }

        [HttpGet("/persons/{id}/getClasses")]
        public async Task<IActionResult> GetClassesPerTermAsync(int personId)
        {
            var classes = await _personService.GetClassesPerTermAsync(personId);

       
            //if (classes == null || classes.Length == 0)
            //{
            //    return NotFound($"No classes found for person with ID");
            //}

            return Ok(classes); 
        }

        [HttpGet("/persons/")]
        public async Task<IActionResult> GetPersonById(int personId)
        {
            var person = await _personService.GetPersonByIdAsync(personId);

            if (person == null)
            {
                return NotFound("No person with that id found");
            }
            return Ok(person);
        }

    }
}
