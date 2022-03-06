using Microsoft.AspNetCore.Mvc;

namespace SFGServer.Controllers;

public record RegisterRequest(string Username, string Email, string Password);

public record RegisterResponse(string Token, string Id);

public record GuestRequest(string Username);

[ApiController]
[Route("v1/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("/register")]
    public RegisterResponse Register([FromBody] RegisterRequest registerRequest)
    {
        throw new NotImplementedException();
    }

    [HttpPost("/guest")]
    public TokenResponse Guest([FromBody] GuestRequest guestRequest)
    {
        throw new NotImplementedException();
    }
}
