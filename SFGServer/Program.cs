global using FastEndpoints;
global using FastEndpoints.Security;

using FastEndpoints.Swagger;
using SFGServer.DAL;
using SFGServer.Services;
using SFGServer.Settings;

var builder = WebApplication.CreateBuilder(args);
AddSettingsToServices();
RegisterServices(builder);

builder.Services.AddDbContext<SfgContext>();
builder.Services.AddFastEndpoints();
builder.Services.AddSwaggerDoc();

{
    // get settings manually for AddAuthenticationJWTBearer
    var jwtSettings = new JwtSettings();
    builder.Configuration.GetSection(nameof(JwtSettings))
                     .Bind(jwtSettings);

    builder.Services.AddAuthenticationJWTBearer(jwtSettings.SigningKey);
}

builder.Services.AddControllers();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.UseFastEndpoints(config => {
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


void RegisterServices(WebApplicationBuilder builder)
{
    builder.Services.AddScoped<TokenSigner>();
    builder.Services.AddScoped<RegisterAccountService>();
    builder.Services.AddScoped<WorldCreatorService>();
}

void AddSettingsToServices()
{
    // TODO(improve): probably want something generic that scans the settings folder, but idc for now
    builder.Services.AddOptions<JwtSettings>()
        .BindConfiguration(nameof(JwtSettings));
}
