global using FastEndpoints;
global using FastEndpoints.Security;
global using SFGServer.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<SfgContext>();

builder.Services.AddFastEndpoints();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseFastEndpoints(config =>
{
    config.RoutingOptions = options => options.Prefix = "v1";
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
