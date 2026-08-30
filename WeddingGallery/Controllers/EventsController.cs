using Microsoft.AspNetCore.Mvc;
using WeddingGallery.Api.Data;
using WeddingGallery.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace WeddingGallery.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            var newEvent = new Event
            {
                Title = dto.Title,
                EventDate = dto.EventDate,
                AccessCode = dto.AccessCode
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return Ok(newEvent);
        }

        [HttpGet("{accessCode}")]
        public async Task<IActionResult> GetEventByCode([FromRoute] string accessCode)
        {
            var ev = await _context.Events.FirstOrDefaultAsync(e => e.AccessCode == accessCode);

            if (ev == null)
                return NotFound("Código de evento inválido.");

            
            return Ok(new
            {
                ev.Id,
                ev.Title,
                ev.EventDate
            });
        }
    }

    public class CreateEventDto
    {
        public string Title { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string AccessCode { get; set; } = string.Empty;
    }
}