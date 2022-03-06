global using FastEndpoints;
global using FastEndpoints.Security;
global using SFGServer.Data;
using FastEndpoints.Swagger;
using SFGServer.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<TokenSigner>();
builder.Services.AddDbContext<SfgContext>();
builder.Services.AddFastEndpoints();
builder.Services.AddSwaggerDoc();
builder.Services.AddAuthenticationJWTBearer(new TokenSigner(builder.Configuration).JwtSigningKey);

builder.Services.AddControllers();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.UseFastEndpoints(config =>
{
    config.RoutingOptions = options => options.Prefix = "v1";
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi3(s => s.ConfigureDefaults());
}

app.MapControllers();

app.Run();
