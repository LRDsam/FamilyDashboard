# --- build stage -----------------------------------------------------
# Full .NET SDK: has the compiler, used only to produce the published
# output. This stage is discarded from the final image.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy just the project file first and restore, so Docker can cache
# this (slow) layer as long as the .csproj itself hasn't changed —
# it only re-runs when dependencies change, not on every code edit.
COPY FamilyDashboard.Api.csproj .
RUN dotnet restore

# Now copy the rest of the source and publish.
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# --- runtime stage -----------------------------------------------------
# Small ASP.NET runtime-only image — no compiler, just what's needed
# to run the already-built app. This is the image that actually ships.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# ASP.NET Core's official container images listen on port 8080 by
# default (via the ASPNETCORE_HTTP_PORTS env var baked into the base
# image) — no extra config needed to make that match.
EXPOSE 8080

ENTRYPOINT ["dotnet", "FamilyDashboard.Api.dll"]
