using Microsoft.EntityFrameworkCore;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Controllers;

public record struct RegisterRequest(string Username, string Email, string Password);

public record struct RegisterResponse(string Token, string Id);

public class RegisterEndpoint : Endpoint<RegisterRequest, RegisterResponse>
{
    private readonly SfgContext _sfgContext;
    private readonly TokenSigner _tokenSigner;

    public RegisterEndpoint(SfgContext sfgContext, TokenSigner tokenSigner)
    {
        _sfgContext = sfgContext;
        _tokenSigner = tokenSigner;
    }

    public override void Configure()
    {
        Post("/auth/register");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RegisterRequest req, CancellationToken ct)
    {
        // TODO(review): better way to compare strings here?
        var usernameExists = await _sfgContext.Accounts.AnyAsync(account => account.Username == req.Username, ct);

        if (usernameExists)
        {
            await Fail(ct);
            return;
        }

        // TODO(review): better way to compare strings here?
        var emailExists = await _sfgContext.Accounts.AnyAsync(account => account.Email == req.Email, ct);

        if (emailExists)
        {
            await Fail(ct);
            return;
        }

        var password = BCrypt.Net.BCrypt.HashPassword(req.Password);

        var utcNowMs = (long)DateTime.UtcNow.Subtract(DateTime.UnixEpoch).TotalMilliseconds;

        // TODO(review): i don't know EFCore well enough to know when to not save
        var account = await _sfgContext.Accounts.AddAsync(new Account
        {
            Username = req.Username,
            Email = req.Email,
            Password = password,
            MaxEnergy = 100,
            LastEnergyAmount = 100,
            TimeEnergyWasAtAmount = utcNowMs,
            EnergyRegenerationRateMs = (int)TimeSpan.FromMinutes(5).TotalMilliseconds,
        }, ct);

        await _sfgContext.SaveChangesAsync(ct);

        var world = await _sfgContext.Worlds.AddAsync(new Models.World()
        {
            Owner = account.Entity,
            Name = $"{req.Username}'s World",
            Width = 50,
            Height = 50,
            // TODO(javascript): generate world data
            RawWorldData = "[]",
            WorldDataVersion = 2,
        }, ct);

        await _sfgContext.SaveChangesAsync(ct);

        account.Entity.Worlds.Add(world.Entity);

        await _sfgContext.SaveChangesAsync(ct);

        var token = _tokenSigner.Sign(account.Entity.Id);

        // TODO(api-revision): the JWT should contain the account ID for the user to parse themselves
        await SendAsync(new RegisterResponse(token, account.Entity.Id.ToString()), cancellation: ct);
    }

    private Task Fail(CancellationToken ct)
    {
        AddError("Username or email taken.");
        return SendErrorsAsync(ct);
    }
}
