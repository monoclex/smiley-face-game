using FastEndpoints.Validation;
using SFGServer.Services;

namespace SFGServer.Contracts.Requests;

public class BuyShopItemRequest
{
    [FromClaim(TokenSigner.UserIdClaimKey)]
    public Guid UserId { get; set; }

    public uint Id { get; set; }

    public uint SpendEnergy { get; set; }
}
