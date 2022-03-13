using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SFGServer.Settings;

namespace SFGServer.Services;

/// <summary>
/// For use in scenarios where we can't let the framework validate the token for us - for example, on websocket endpoints.
/// </summary>
public class JwtTokenValidator
{
    private readonly JwtBearerOptions _options;

    public JwtTokenValidator(IOptionsSnapshot<JwtBearerOptions> options)
    {
        _options = options.Get(JwtBearerDefaults.AuthenticationScheme);
    }

    public (ClaimsPrincipal, SecurityToken) Validate(string token)
    {
        var validator = _options.SecurityTokenValidators.FirstOrDefault();

        if (validator == null)
        {
            throw new InvalidOperationException("No validators configured!");
        }

        var claimsPrincipal = validator.ValidateToken(token, _options.TokenValidationParameters, out var securityToken);

        if (claimsPrincipal == null || securityToken == null)
        {
            throw new InvalidOperationException("Unable to get ClaimsPrincipal or SecurityToken!");
        }

        return (claimsPrincipal, securityToken);
    }
}
