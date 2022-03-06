using Microsoft.AspNetCore.Mvc;

namespace SFGServer.Controllers;

public record GuestRequest(string Username);

[ApiController]
[Route("v1/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("/guest")]
    public TokenResponse Guest([FromBody] GuestRequest guestRequest)
    {
        throw new NotImplementedException();
    }
}
