# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ServiceCRM/ServiceCRM.csproj", "ServiceCRM/"]
RUN dotnet restore "ServiceCRM/ServiceCRM.csproj"

COPY . .
WORKDIR "/src/ServiceCRM"
RUN dotnet publish "ServiceCRM.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "ServiceCRM.dll"]
