using SFGServer.Services;

namespace SFGServer.Contracts.Requests.Player;

public class PlayerRequest
{
    [FromClaim(TokenSigner.UserIdClaimKey, IsRequired = true)]
    public Guid UserId { get; set; }
}
