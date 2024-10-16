using Capstone.Data;
using Capstone.Models;
using Microsoft.EntityFrameworkCore;

namespace Capstone.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly SeaAggieCorpContext _context;

        public DocumentService(SeaAggieCorpContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync()
        {
            return await _context.Documents.ToListAsync();
        }

        public async Task<Document?> GetDocumentByIdAsync(int id)
        {
            return await _context.Documents.FindAsync(id);
        }

        public async Task<bool> UploadDocumentAsync(IFormFile file)
        {
            if (file.Length > 0)
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);

                var document = new Document
                {
                    Name = file.FileName,
                    UploadDate = DateTime.Now,
                    Content = stream.ToArray()
                };

                _context.Documents.Add(document);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }
    }
}