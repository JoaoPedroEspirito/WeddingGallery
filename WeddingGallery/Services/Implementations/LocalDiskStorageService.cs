using WeddingGallery.Api.Services.Interfaces;

namespace WeddingGallery.Api.Services.Implementations
{
    public class LocalDiskStorageService : IStorageService
    {
        private readonly IWebHostEnvironment _env;

        public LocalDiskStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, Guid eventId)
        {
            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var eventFolder = Path.Combine(webRootPath, "uploads", eventId.ToString());
            if (!Directory.Exists(eventFolder)) Directory.CreateDirectory(eventFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(eventFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(stream);
            }
            return $"/uploads/{eventId}/{uniqueFileName}";
        }
    }
}