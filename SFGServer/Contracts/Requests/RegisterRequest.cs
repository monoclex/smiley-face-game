namespace SFGServer.Contracts.Requests;

public record struct RegisterRequest(string Username, string Email, string Password);
