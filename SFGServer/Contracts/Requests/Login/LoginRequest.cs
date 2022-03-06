namespace SFGServer.Contracts.Requests.Login;

public record struct LoginRequest(string Email, string Password);
