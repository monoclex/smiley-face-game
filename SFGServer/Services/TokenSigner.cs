namespace SFGServer.Services;

public class TokenSigner
{
    private readonly string _jwtSigningKey;

    public TokenSigner(IConfiguration configuration)
    {
        // TODO(review): what's the proper way to inject configuration to a class?
        // TODO(warnings): tl;dr: 'GetValue' has 'RequiresUnreferencedCodeAttribute' which can break functionality when trimming application code.
        _jwtSigningKey = configuration.GetRequiredSection("Secrets").GetValue<string>("JwtSigningKey");
    }

    public string Sign(Guid userId)
    {
        return JWTBearer.CreateToken(
            signingKey: _jwtSigningKey,
            expireAt: DateTime.UtcNow.AddHours(4),
            roles: new [] { userId.ToString() }
        );
    }
}
