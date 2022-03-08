global using FastEndpoints;
global using FastEndpoints.Security;

using FastEndpoints.Swagger;
using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.Game;
using SFGServer.Game.Services;
using SFGServer.Services;
using SFGServer.Settings;

var builder = WebApplication.CreateBuilder(args);
AddSettingsToServices();
RegisterServices();

builder.Services.AddDbContext<SfgContext>();
builder.Services.AddFastEndpoints();
builder.Services.AddSwaggerDoc();
builder.Services.AddCors();

{
    // get settings manually for AddAuthenticationJWTBearer
    var jwtSettings = new JwtSettings();
    builder.Configuration.GetSection(nameof(JwtSettings))
                     .Bind(jwtSettings);

    builder.Services.AddAuthenticationJWTBearer(jwtSettings.SigningKey);
}

builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var sfgContext = scope.ServiceProvider.GetRequiredService<SfgContext>();
    await sfgContext.Database.MigrateAsync();
}

app.UseCors(config =>
{
    config.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
});

app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(1),
});

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


void RegisterServices()
{
    builder.Services.AddScoped<TokenSigner>();
    builder.Services.AddTransient<JwtTokenValidator>();
    builder.Services.AddTransient<SfgTokenValidator>();
    builder.Services.AddScoped<RegisterAccountService>();
    builder.Services.AddScoped<WorldCreatorService>();
    builder.Services.AddSingleton(typeof(IScopedServiceFactory<>), typeof(ScopedServiceFactory<>));
    builder.Services.AddSingleton<RoomManager>();
    builder.Services.AddSingleton<RoomStorage>();
    builder.Services.AddScoped<LoadSavedRoomService>();
    builder.Services.AddSingleton<CreateDynamicRoomService>();
    builder.Services.AddScoped<WorldSaver>();
    builder.Services.AddSingleton<GenerateBlankWorldService>();
    builder.Services.AddSingleton<GenerateWorldIdService>();
    builder.Services.AddScoped<UsernameRetrievalService>();
    builder.Services.AddSingleton<StartRoomService>();
    builder.Services.AddSingleton<RoomKillService>();
}

void AddSettingsToServices()
{
    // TODO(improve): probably want something generic that scans the settings folder, but idc for now
    builder.Services.AddOptions<JwtSettings>()
        .BindConfiguration(nameof(JwtSettings));

    builder.Services.AddOptions<JavaScriptCodeSettings>()
        .BindConfiguration(nameof(JavaScriptCodeSettings));
}
