namespace SFGServer.Contracts.Requests;

public record struct LoginRequest(string Email, string Password);
