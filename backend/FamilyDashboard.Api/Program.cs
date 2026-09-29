using System.Net.Security;
using System.Text;
using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Hue;
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

// Typed HttpClient — the recommended way to use HttpClient in
// ASP.NET Core (managed pooling/lifetime via IHttpClientFactory
// under the hood, avoiding the socket-exhaustion issues of manually
// new-ing one up).
//
// The custom handler below is needed because HueClient talks to two
// very different kinds of HTTPS endpoint: Hue's public discovery
// service (a normal, publicly-trusted certificate — keep validating
// that as usual) and the local bridge itself (a certificate signed
// by Hue's own private root CA, which this machine doesn't trust by
// default). Rather than disabling certificate validation for all
// HTTPS traffic this client makes, the callback only bypasses it for
// requests that aren't going to the discovery host.
builder.Services
    .AddHttpClient<HueClient>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        var handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = (message, _, _, errors) =>
            message.RequestUri?.Host == "discovery.meethue.com" ? errors == SslPolicyErrors.None : true;
        return handler;
    });

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
// accounts (from configuration/User Secrets) and the singleton
// AppSettings row, if they don't exist yet. Running migrations here
// (rather than via `dotnet ef database update` from a dev machine)
// means the container is self-contained — no separate migration step
// needed on the host it's deployed to.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

    await dbContext.Database.MigrateAsync();
    await UserSeeder.SeedAsync(dbContext, passwordHasher, app.Configuration);
    await AppSettingsSeeder.SeedAsync(dbContext);
}

app.Run();
