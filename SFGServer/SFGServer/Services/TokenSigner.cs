using Microsoft.Extensions.Options;
using SFGServer.Settings;

namespace SFGServer.Services;

public class TokenSigner
{
    public const string UserIdClaimKey = "aud";
    public const string GuestUsername = "name";

    private readonly JwtSettings _jwtSettings;

    public TokenSigner(IOptions<JwtSettings> options)
    {
        _jwtSettings = options.Value;
    }

    public string Sign(Guid userId)
    {
        return JWTBearer.CreateToken(
            signingKey: _jwtSettings.SigningKey,
            expireAt: DateTime.UtcNow.AddHours(4),
            permissions: new[] { "play" },
            claims: new[] { (UserIdClaimKey, userId.ToString()) }
        );
    }

    public string SignGuest(string username)
    {
        return JWTBearer.CreateToken(
            signingKey: _jwtSettings.SigningKey,
            expireAt: null, // no reason for token to expire
            permissions: new[] { "play" },
            claims: new[] { (UserIdClaimKey, ""), (GuestUsername, username) }
        );
    }
}
