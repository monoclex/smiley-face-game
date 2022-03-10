using System.Text.RegularExpressions;
using FastEndpoints.Validation;

namespace SFGServer.ValidationRules;

public static partial class ValidatorExtensions
{
    private static Regex UsernameRegex { get; } = new Regex("^[A-Za-z0-9_]+$", RegexOptions.Compiled);

    public static IRuleBuilder<T, string> MustBeUsername<T>(this IRuleBuilder<T, string> ruleBuilderOptions)
    {
        return ruleBuilderOptions
            .Must(UsernameRegex.IsMatch)
            .MinimumLength(3)
            .MaximumLength(20);
    }
}
