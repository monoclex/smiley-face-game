using SFGServer.Services;

namespace SFGServer.Contracts.Requests;

public class PlayerRequest
{
    [FromClaim(TokenSigner.UserIdClaimKey, IsRequired = true)]
    public Guid UserId { get; set; }
}
