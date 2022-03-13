using SFGServer.Services;

namespace SFGServer.Contracts.Requests;

public class ShopItemsRequest
{
    [FromClaim(TokenSigner.UserIdClaimKey)]
    public Guid UserId { get; set; }
}
