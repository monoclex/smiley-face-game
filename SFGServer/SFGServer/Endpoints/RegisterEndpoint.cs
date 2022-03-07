using SFGServer.Contracts.Requests;
using SFGServer.Contracts.Responses;
using SFGServer.Services;

namespace SFGServer.Endpoints;

public class RegisterEndpoint : Endpoint<RegisterRequest, RegisterResponse>
{
    private readonly TokenSigner _tokenSigner;
    private readonly RegisterAccountService _registerAccountService;

    public RegisterEndpoint(TokenSigner tokenSigner, RegisterAccountService registerAccountService)
    {
        _tokenSigner = tokenSigner;
        _registerAccountService = registerAccountService;
    }

    public override void Configure()
    {
        Post("/auth/register");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RegisterRequest req, CancellationToken ct)
    {
        var (success, account) = await _registerAccountService.TryRegisterAsync(req.Username, req.Email, req.Password, ct);
        if (!success)
        {
            await Fail(ct);
            return;
        }

        var token = _tokenSigner.Sign(account!.Id);
        // TODO(api-revision): the JWT should contain the account ID for the user to parse themselves
        await SendAsync(new RegisterResponse(token, account.Id.ToString()), cancellation: ct);
    }

    private Task Fail(CancellationToken ct)
    {
        AddError("Username or email taken.");
        return SendErrorsAsync(ct);
    }
}
