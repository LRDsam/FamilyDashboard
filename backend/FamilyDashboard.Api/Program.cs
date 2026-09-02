using System.Text;
using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Models;
using FamilyDashboard.Api.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Hashes/verifies passwords (PBKDF2 under the hood) — no plain-text
// passwords are ever stored.
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtSigningKey =
    jwtSection["SigningKey"] ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Checks the token was issued by us, is meant for our
            // frontend, hasn't expired, and is signed with our key
            // (so it wasn't forged or tampered with).
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<JwtTokenGenerator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Frontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod();
        }
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// No app.UseHttpsRedirection() here: this API has no HTTPS listener
// configured anywhere (no certificate), and in production it sits
// behind nginx, which talks to it over plain HTTP inside the Docker
// network — a redirect-to-HTTPS would break that proxying.

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply any pending EF Core migrations, then create the fixed family
// accounts (from configuration/User Secrets) if they don't exist yet.
// Running migrations here (rather than via `dotnet ef database
// update` from a dev machine) means the container is self-contained —
// no separate migration step needed on the host it's deployed to.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

    await dbContext.Database.MigrateAsync();
    await UserSeeder.SeedAsync(dbContext, passwordHasher, app.Configuration);
}

app.Run();
