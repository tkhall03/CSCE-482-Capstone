using Capstone.Models;

namespace Capstone.Services
{
    public interface IDocumentService
    {
        Task<IEnumerable<Document>> GetAllDocumentsAsync();
        Task<Document?> GetDocumentByIdAsync(int id);
        Task<bool> UploadDocumentAsync(IFormFile file);
    }
}