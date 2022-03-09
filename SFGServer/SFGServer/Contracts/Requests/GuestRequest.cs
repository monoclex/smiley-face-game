using FastEndpoints.Validation;
using JetBrains.Annotations;
using SFGServer.ValidationRules;

namespace SFGServer.Contracts.Requests;

public record GuestRequest
{
    public string Username { get; set; } = null!;
}

[UsedImplicitly]
public class GuestRequestValidator : Validator<GuestRequest>
{
    public GuestRequestValidator()
    {
        RuleFor(x => x.Username)
            .MustBeUsername();
    }
}
