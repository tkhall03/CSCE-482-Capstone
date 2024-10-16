using Microsoft.EntityFrameworkCore;
using Capstone.Data;
using Capstone.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SeaAggie API",
        Version = "v1"
    });

    // Register the operation filter for file uploads
    c.OperationFilter<AddFileUploadOperationFilter>();
});

builder.Services.AddDbContext<SeaAggieCorpContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CapstoneDB")));

//document storage
builder.Services.AddScoped<IDocumentService, DocumentService>();

builder.Services.AddScoped<IPersonService, PersonService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();