using Microsoft.Extensions.Options;
using SFGServer.Settings;

namespace SFGServer.Services;

public class TokenSigner
{
    public const string UserIdClaimKey = "UserId";
    public const string GuestUsernameClaimKey = "GuestUsername";

    public JwtSettings _jwtSettings { get; }

    public TokenSigner(IOptions<JwtSettings> options)
    {
        _jwtSettings = options.Value;
    }

    // TODO(api-parity): we should customize token generation to maintain compat with tokens generated by JS apis

    public string Sign(Guid userId)
    {
        return JWTBearer.CreateToken(
            signingKey: _jwtSettings.SigningKey,
            expireAt: DateTime.UtcNow.AddHours(4),
            claims: new[] { (UserIdClaimKey, userId.ToString()) }
        );
    }

    public string SignGuest(string username)
    {
        return JWTBearer.CreateToken(
            signingKey: _jwtSettings.SigningKey,
            expireAt: null, // no reason for token to expire
            claims: new[] { (GuestUsernameClaimKey, username) }
        );
    }
}
