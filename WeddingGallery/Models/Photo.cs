namespace WeddingGallery.Api.Models
{
    public class Photo
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid EventId { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string StorageReference { get; set; } = string.Empty;
        public string ThumbnailReference { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeInBytes { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;


        
        public Event Event { get; set; } = null!;
    }
}