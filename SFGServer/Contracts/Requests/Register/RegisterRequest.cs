namespace SFGServer.Contracts.Requests.Register;

public record struct RegisterRequest(string Username, string Email, string Password);
