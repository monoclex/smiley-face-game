using Microsoft.AspNetCore.Mvc;

namespace SFGServer.Controllers;

public record LoginRequest(string Email, string Password);
public record TokenResponse(string Token);

public record RegisterRequest(string Username, string Email, string Password);

public record RegisterResponse(string Token, string Id);

public record GuestRequest(string Username);

[ApiController]
[Route("v1/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("/login")]
    public TokenResponse Login([FromBody] LoginRequest loginRequest)
    {
        throw new NotImplementedException();
    }

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
