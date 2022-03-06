using SFGServer.Services;

namespace SFGServer.Controllers;

public record struct GuestRequest(string Username);

public class GuestEndpoint : Endpoint<GuestRequest, TokenResponse>
{
    private readonly TokenSigner _tokenSigner;

    public GuestEndpoint(TokenSigner tokenSigner)
    {
        _tokenSigner = tokenSigner;
    }

    public override void Configure()
    {
        Post("/auth/guest");
        AllowAnonymous();
    }

    public override Task HandleAsync(GuestRequest req, CancellationToken ct)
    {
        var token = _tokenSigner.SignGuest(req.Username);

        return SendAsync(new TokenResponse(token), cancellation: ct);
    }
}
