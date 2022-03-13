using FastEndpoints.Validation;
using JetBrains.Annotations;
using SFGServer.ValidationRules;

namespace SFGServer.Contracts.Requests;

public record class RegisterRequest
{
    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}

[UsedImplicitly]
public class RegisterRequestValidator : Validator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .MustBeUsername();

        RuleFor(x => x.Email)
            .MustBeEmail();

        RuleFor(x => x.Password)
            .MustBePassword();
    }
}
