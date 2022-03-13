using System.Buffers;
using System.Diagnostics;
using Prometheus;

namespace SFGServer;

public struct RentedArray<T> : IDisposable
{
    private readonly ArrayPool<T> _arrayPool;
    public T[] Buffer { get; }
    public int RentedLength { get; }

    public RentedArray(ArrayPool<T> arrayPool, T[] buffer, int rentedLength)
    {
        _arrayPool = arrayPool;
        Buffer = buffer;
        RentedLength = rentedLength;
    }

    public void Dispose()
    {
        _arrayPool.Return(Buffer);
    }
}

public struct ValueStopwatch
{
    private static readonly double TimestampToTicks = 10000000.0 / (double) Stopwatch.Frequency;
    private long _startTimestamp;

    public bool IsActive => (ulong) this._startTimestamp > 0UL;

    private ValueStopwatch(long startTimestamp) => this._startTimestamp = startTimestamp;

    public static ValueStopwatch StartNew() => new ValueStopwatch(Stopwatch.GetTimestamp());

    public TimeSpan GetElapsedTime()
    {
        if (!this.IsActive)
            throw new InvalidOperationException("An uninitialized, or 'default', ValueStopwatch cannot be used to get elapsed time.");
        long num = checked (Stopwatch.GetTimestamp() - this._startTimestamp);
        return new TimeSpan(checked ((long) unchecked (ValueStopwatch.TimestampToTicks * (double) num)));
    }
}

public sealed class PrometheusTimer : ITimer, IDisposable
{
    private readonly ValueStopwatch _stopwatch = ValueStopwatch.StartNew();

    public IObserver Observer { get; set; } = null!;

    public TimeSpan ObserveDuration()
    {
        TimeSpan elapsedTime = this._stopwatch.GetElapsedTime();
        Observer.Observe(elapsedTime.TotalSeconds);
        return elapsedTime;
    }

    public void Dispose() => this.ObserveDuration();
}

public static class Helpers
{
    public static RentedArray<T> UseRent<T>(this ArrayPool<T> arrayPool, int minimumLength)
    {
        return new RentedArray<T>(arrayPool, arrayPool.Rent(minimumLength), minimumLength);
    }

    public static PrometheusTimer NewCustomTimer(this Summary summary)
    {
        return new PrometheusTimer { Observer = summary };
    }
}
