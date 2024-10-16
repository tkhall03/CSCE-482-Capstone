using System.ComponentModel.DataAnnotations;

namespace Capstone.Models
{
    public class Document
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; //default

        [Required]
        public DateTime UploadDate { get; set; }

        public byte[] Content { get; set; } = Array.Empty<byte>(); // Store large PDFs using FILESTREAM
    }
}
