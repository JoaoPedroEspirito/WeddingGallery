using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using WeddingGallery.Api.Services.Interfaces;

namespace WeddingGallery.Api.Services
{
    public class SupabaseStorageService : IStorageService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _bucketName = "wedding-uploads";

        public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, Guid eventId)
        {
            var supabaseUrl = _configuration["SupabaseUrl"];
            var supabaseKey = _configuration["SupabaseKey"];

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = $"{eventId}/{uniqueFileName}";
            var uploadUrl = $"{supabaseUrl}/storage/v1/object/{_bucketName}/{filePath}";

            using var content = new StreamContent(fileStream);

            var contentType = fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ? "image/png" : "image/jpeg";
            content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl)
            {
                Content = content
            };

            request.Headers.Add("apikey", supabaseKey);
            request.Headers.Add("Authorization", $"Bearer {supabaseKey}");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao enviar para o Supabase: {error}");
            }

            return $"{supabaseUrl}/storage/v1/object/public/{_bucketName}/{filePath}";
        }
    }
}