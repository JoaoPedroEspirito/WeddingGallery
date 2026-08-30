using Microsoft.AspNetCore.Http;

namespace WeddingGallery.Api.Services.Interfaces
{
    public interface IStorageService
    {
        
        Task<string> UploadFileAsync(Stream fileStream, string fileName, Guid eventId);
    }
}