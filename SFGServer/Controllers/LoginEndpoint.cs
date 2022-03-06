using Microsoft.EntityFrameworkCore;

namespace SFGServer.Controllers;

public record struct LoginRequest(string Email, string Password);
public record struct TokenResponse(string Token);

public class LoginEndpoint : Endpoint<LoginRequest, TokenResponse>
{
    private readonly SfgContext _sfgContext;
    private readonly string _jwtSigningKey;

    public LoginEndpoint(SfgContext sfgContext, IConfiguration configuration)
    {
        _sfgContext = sfgContext;
        // TODO(review): what's the proper way to inject configuration to a class?
        // TODO(warnings): tl;dr: 'GetValue' has 'RequiresUnreferencedCodeAttribute' which can break functionality when trimming application code.
        _jwtSigningKey = configuration.GetRequiredSection("Secrets").GetValue<string>("JwtSigningKey");
    }

    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        // TODO(review): what would be the proper way to compare strings here? OrdinalInvariantCulture or something?
        var account = await _sfgContext.Accounts.FirstOrDefaultAsync(account => account.Email == req.Email, cancellationToken: ct);

        if (account == null)
        {
            await Fail(ct);
            return;
        }

        var correctPassword = BCrypt.Net.BCrypt.Verify(req.Password, account.Password);

        if (!correctPassword)
        {
            await Fail(ct);
            return;
        }

        var token = JWTBearer.CreateToken(
            signingKey: _jwtSigningKey,
            expireAt: DateTime.UtcNow.AddHours(4),
            roles: new [] { account.Id.ToString() }
        );

        await SendAsync(new TokenResponse(token), cancellation: ct);
    }

    private Task Fail(CancellationToken ct)
    {
        AddError("Login failed.");
        return SendErrorsAsync(ct);
    }
}
