namespace SFGServer.Services;

public interface IScopedServiceFactory<out T>
{
    IScopedService<T> CreateScopedService();
}

public interface IScopedService<out T> : IDisposable
{
    T Service { get; }
}

public class ScopedServiceFactory<T> : IScopedServiceFactory<T>
    where T : notnull
{
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public ScopedServiceFactory(IServiceScopeFactory serviceScopeFactory)
    {
        _serviceScopeFactory = serviceScopeFactory;
    }

    public IScopedService<T> CreateScopedService()
    {
        var scope = _serviceScopeFactory.CreateScope();
        return new ScopedService<T>(scope);
    }

    private class ScopedService<TService> : IScopedService<TService>
        where TService : notnull
    {
        private readonly IServiceScope _serviceScope;

        public ScopedService(IServiceScope serviceScope)
        {
            _serviceScope = serviceScope;
            Service = _serviceScope.ServiceProvider.GetRequiredService<TService>();
        }

        public TService Service { get; }

        public void Dispose()
        {
            _serviceScope.Dispose();
        }
    }
}
