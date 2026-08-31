using Microsoft.AspNetCore.Mvc;
using WeddingGallery.Api.Data;
using WeddingGallery.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace WeddingGallery.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public EventsController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            var newEvent = new Event
            {
                Title = dto.Title,
                EventDate = dto.EventDate,
                AccessCode = "NAO_USADO"
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return Ok(newEvent);
        }
        
        [HttpGet("{accessCode}")]
        public async Task<IActionResult> GetEventByCode([FromRoute] string accessCode)
        {
            var senhaCorreta = _configuration["CodigoAcesso"];

            if (string.IsNullOrEmpty(senhaCorreta) || accessCode.Trim().ToUpper() != senhaCorreta.Trim().ToUpper())
                return Unauthorized(new { message = "Código de evento inválido." });

            var ev = await _context.Events.FirstOrDefaultAsync();

            if (ev == null)
                return NotFound(new { message = "Evento não configurado no banco de dados." });

            return Ok(new
            {
                ev.Id,
                ev.Title,
                ev.EventDate,
                AccessCode = senhaCorreta
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