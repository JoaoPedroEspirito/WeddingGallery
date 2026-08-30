namespace WeddingGallery.Api.Models
{
    public class Event
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string AccessCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}