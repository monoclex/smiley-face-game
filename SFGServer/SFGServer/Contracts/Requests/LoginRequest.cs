using FastEndpoints.Validation;
using JetBrains.Annotations;
using SFGServer.ValidationRules;

namespace SFGServer.Contracts.Requests;

public record LoginRequest
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}

[UsedImplicitly]
public class LoginRequestValidator : Validator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .MustBeEmail();

        RuleFor(x => x.Password)
            .MustBePassword();
    }
}
