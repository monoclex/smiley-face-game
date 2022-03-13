FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

COPY SFGServer.sln .
COPY SFGServer/SFGServer.csproj SFGServer/SFGServer.csproj
COPY SFGServer.DAL/SFGServer.DAL.csproj SFGServer.DAL/SFGServer.DAL.csproj
RUN dotnet restore .

COPY . .
RUN dotnet publish -c Release

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS app
WORKDIR /app

COPY --from=build /app/SFGServer/bin/Release/net6.0/ ./
ENTRYPOINT ["./SFGServer"]
