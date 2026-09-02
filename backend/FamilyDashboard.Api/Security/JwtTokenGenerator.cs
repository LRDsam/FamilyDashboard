using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FamilyDashboard.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace FamilyDashboard.Api.Security;

/// <summary>
/// Builds signed JWTs for authenticated users.
/// </summary>
public class JwtTokenGenerator(IConfiguration configuration)
{
    public string GenerateToken(User user)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var signingKey =
            jwtSection["SigningKey"] ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");
        var expiryMinutes = jwtSection.GetValue<int>("ExpiryMinutes");

        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
        ];

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
