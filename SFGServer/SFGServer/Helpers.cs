using System.Buffers;

namespace SFGServer;

public struct RentedArray<T> : IDisposable
{
    private readonly ArrayPool<T> _arrayPool;
    public T[] Buffer { get; }

    public RentedArray(ArrayPool<T> arrayPool, T[] buffer)
    {
        _arrayPool = arrayPool;
        Buffer = buffer;
    }

    public void Dispose()
    {
        _arrayPool.Return(Buffer);
    }
}

public static class Helpers
{
    public static RentedArray<T> UseRent<T>(this ArrayPool<T> arrayPool, int minimumLength)
    {
        return new RentedArray<T>(arrayPool, arrayPool.Rent(minimumLength));
    }
}
