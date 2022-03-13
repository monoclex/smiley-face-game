using Prometheus;

namespace SFGServer;

public static class SfgMetrics
{
    public static readonly Gauge PlayersConnected = Metrics.CreateGauge("sfg_players_per_room_connected", "Number of players connected per room", new GaugeConfiguration {
        LabelNames = new[] { "room_id" }
    });
    public static readonly Gauge WebsocketConnectionsConnected = Metrics.CreateGauge("sfg_websocket_connections_connected", "Number of websocket connections connected");
    public static readonly Gauge RoomsOnlineTotal = Metrics.CreateGauge("sfg_rooms_online_total", "Number of rooms online");

    public static readonly Counter PacketsHandledTotal = Metrics.CreateCounter("sfg_packets_handled_total", "Number of packets handled in total", new CounterConfiguration {
        LabelNames = new[] { "packet_id" }
    });

    public static readonly Summary OnMessageDurationSummary = Metrics.CreateSummary("sfg_onmessage_call_duration_seconds", "Summary of onmessage call processing durations", new SummaryConfiguration {
        LabelNames = new[] { "packet_id" }
    });

    public static void Init()
    {
        PlayersConnected.Publish();
        WebsocketConnectionsConnected.Publish();
        RoomsOnlineTotal.Publish();

        PacketsHandledTotal.Publish();

        OnMessageDurationSummary.Publish();
    }
}
