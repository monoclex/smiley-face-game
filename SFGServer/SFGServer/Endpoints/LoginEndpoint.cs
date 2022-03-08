using Microsoft.EntityFrameworkCore;
using SFGServer.Contracts.Requests;
using SFGServer.Contracts.Responses;
using SFGServer.DAL;
using SFGServer.Services;

namespace SFGServer.Endpoints;

public class LoginEndpoint : Endpoint<LoginRequest, TokenResponse>
{
    private readonly SfgContext _sfgContext;
    private readonly TokenSigner _tokenSigner;

    public LoginEndpoint(SfgContext sfgContext, TokenSigner tokenSigner)
    {
        _sfgContext = sfgContext;
        _tokenSigner = tokenSigner;
    }

    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
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

        var token = _tokenSigner.Sign(account.Id);
        await SendAsync(new TokenResponse(token), cancellation: ct);
    }

    private Task Fail(CancellationToken ct)
    {
        AddError("Login failed.");
        return SendErrorsAsync(cancellation: ct);
    }
}
