using FastEndpoints.Validation;

namespace SFGServer.ValidationRules;

public static partial class ValidatorExtensions
{
    public static IRuleBuilder<T, string> MustBePassword<T>(this IRuleBuilder<T, string> ruleBuilderOptions)
    {
        return ruleBuilderOptions
            .MinimumLength(1)
            .MaximumLength(72);
    }
}
