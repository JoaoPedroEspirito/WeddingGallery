using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeddingGallery.Api.Data;
using WeddingGallery.Api.Models;
using WeddingGallery.Api.Services.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.IO;
using System.IO.Compression;
using System.Net.Http;

namespace WeddingGallery.Api.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/[controller]")]
    public class PhotosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStorageService _storageService;
        private readonly IHttpClientFactory _httpClientFactory;

        public PhotosController(AppDbContext context, IStorageService storageService, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _storageService = storageService;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost]
        public async Task<IActionResult> UploadPhoto([FromRoute] Guid eventId, [FromForm] IFormFile file, [FromForm] string guestName = "Anônimo")
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Evento não encontrado.");
            if (file == null || file.Length == 0) return BadRequest("Nenhum arquivo foi enviado.");

            try
            {
                using var originalStream = file.OpenReadStream();
                var originalUrl = await _storageService.UploadFileAsync(originalStream, file.FileName, eventId);

                using var image = await Image.LoadAsync(file.OpenReadStream());

                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(400, 400),
                    Mode = ResizeMode.Crop
                }));

                using var thumbnailStream = new MemoryStream();
                await image.SaveAsJpegAsync(thumbnailStream);
                thumbnailStream.Position = 0;

                var thumbnailUrl = await _storageService.UploadFileAsync(thumbnailStream, $"thumb_{file.FileName}", eventId);

                var photo = new Photo
                {
                    EventId = eventId,
                    GuestName = guestName,
                    OriginalFileName = file.FileName,
                    StorageReference = originalUrl,
                    ThumbnailReference = thumbnailUrl,
                    ContentType = file.ContentType,
                    FileSizeInBytes = file.Length
                };

                _context.Photos.Add(photo);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPhotos), new { eventId = eventId }, new
                {
                    Id = photo.Id,
                    GuestName = photo.GuestName,
                    Url = photo.ThumbnailReference,
                    OriginalUrl = photo.StorageReference,
                    UploadedAt = photo.UploadedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPhotos([FromRoute] Guid eventId)
        {
            var photos = await _context.Photos
                .Where(p => p.EventId == eventId)
                .OrderByDescending(p => p.UploadedAt)
                .Select(p => new
                {
                    p.Id,
                    p.GuestName,
                    Url = string.IsNullOrEmpty(p.ThumbnailReference) ? p.StorageReference : p.ThumbnailReference,
                    OriginalUrl = p.StorageReference,
                    p.UploadedAt
                })
                .ToListAsync();

            return Ok(photos);
        }

        [HttpGet("{photoId}/download")]
        public async Task<IActionResult> DownloadPhoto([FromRoute] Guid eventId, [FromRoute] Guid photoId)
        {
            var photo = await _context.Photos.FindAsync(photoId);
            if (photo == null || photo.EventId != eventId)
                return NotFound("Foto não encontrada.");

            var client = _httpClientFactory.CreateClient();
            try
            {
                var stream = await client.GetStreamAsync(photo.StorageReference);
                return File(stream, photo.ContentType, photo.OriginalFileName);
            }
            catch
            {
                return NotFound("Arquivo não encontrado no bucket de armazenamento.");
            }
        }

        [HttpPost("download-batch")]
        public async Task<IActionResult> DownloadBatch([FromRoute] Guid eventId, [FromBody] List<Guid> photoIds)
        {
            if (photoIds == null || !photoIds.Any())
                return BadRequest("Nenhuma foto foi selecionada.");

            var photos = await _context.Photos
                .Where(p => p.EventId == eventId && photoIds.Contains(p.Id))
                .ToListAsync();

            if (!photos.Any())
                return NotFound("As fotos selecionadas não foram encontradas.");

            var memoryStream = new MemoryStream();
            var client = _httpClientFactory.CreateClient();

            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                foreach (var photo in photos)
                {
                    try
                    {
                      
                        var fileStream = await client.GetStreamAsync(photo.StorageReference);
                        var entryName = $"{photo.Id}_{photo.OriginalFileName}";
                        var zipEntry = archive.CreateEntry(entryName, CompressionLevel.Optimal);

                        using (var entryStream = zipEntry.Open())
                        {
                            await fileStream.CopyToAsync(entryStream);
                        }
                    }
                    catch
                    {
                        
                        continue;
                    }
                }
            }

            memoryStream.Position = 0;
            return File(memoryStream, "application/zip", "Selecao_Casamento.zip");
        }
    }
}