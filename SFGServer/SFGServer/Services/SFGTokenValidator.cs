using SFGServer.Models;

namespace SFGServer.Services;

public class SfgTokenValidator
{
    private readonly JwtTokenValidator _jwtTokenValidator;

    public SfgTokenValidator(JwtTokenValidator jwtTokenValidator)
    {
        _jwtTokenValidator = jwtTokenValidator;
    }

    public UserPlayModel? Validate(string token)
    {
        try
        {
            var (claimsPrincipal, _) = _jwtTokenValidator.Validate(token);

            var username = claimsPrincipal.ClaimValue(TokenSigner.GuestUsername);
            if (username != null)
                return new UserPlayModel.Guest(username);

            var userId = claimsPrincipal.ClaimValue(TokenSigner.UserIdClaimKey);
            if (userId != null)
                return new UserPlayModel.User(Guid.Parse(userId));

            // TODO(logging): weirdly invalid token
            return null;
        }
        catch (Exception)
        {
            // TODO(logging): log failed authorization attempt with token
            return null;
        }
    }
}
