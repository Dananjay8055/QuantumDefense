from statistics import mean, pstdev


def _stats(values):
    if not values:
        return 0, 0, 0, 0

    return (
        min(values),
        max(values),
        mean(values),
        pstdev(values) if len(values) > 1 else 0
    )


def _iat_stats(times):
    if len(times) < 2:
        return 0, 0, 0, 0

    iats = [
        times[i] - times[i - 1]
        for i in range(1, len(times))
    ]

    return (
        mean(iats),
        pstdev(iats) if len(iats) > 1 else 0,
        max(iats),
        min(iats)
    )


def extract_flow_features(flow, destination_port=0):

    duration = max(
        flow["last_time"] - flow["start_time"],
        0
    )

    total_packets = (
        flow["fwd_packets"] +
        flow["bwd_packets"]
    )

    total_bytes = (
        flow["fwd_bytes"] +
        flow["bwd_bytes"]
    )

    fwd_min, fwd_max, fwd_mean, fwd_std = _stats(
        flow["fwd_lengths"]
    )

    bwd_min, bwd_max, bwd_mean, bwd_std = _stats(
        flow["bwd_lengths"]
    )

    packet_min, packet_max, packet_mean, packet_std = _stats(
        flow["packet_lengths"]
    )

    fwd_iat_mean, fwd_iat_std, fwd_iat_max, fwd_iat_min = (
        _iat_stats(flow["fwd_times"])
    )

    bwd_iat_mean, bwd_iat_std, bwd_iat_max, bwd_iat_min = (
        _iat_stats(flow["bwd_times"])
    )

    flow_iat_mean, flow_iat_std, flow_iat_max, flow_iat_min = (
        _iat_stats(flow["packet_times"])
    )

    packet_variance = packet_std ** 2

    features = {
        "Destination Port": destination_port,

        "Flow Duration": duration,

        "Total Fwd Packets":
            flow["fwd_packets"],

        "Total Backward Packets":
            flow["bwd_packets"],

        "Total Length of Fwd Packets":
            flow["fwd_bytes"],

        "Total Length of Bwd Packets":
            flow["bwd_bytes"],

        "Fwd Packet Length Max": fwd_max,
        "Fwd Packet Length Min": fwd_min,
        "Fwd Packet Length Mean": fwd_mean,
        "Fwd Packet Length Std": fwd_std,

        "Bwd Packet Length Max": bwd_max,
        "Bwd Packet Length Min": bwd_min,
        "Bwd Packet Length Mean": bwd_mean,
        "Bwd Packet Length Std": bwd_std,

        "Flow Bytes/s":
            total_bytes / duration if duration > 0 else 0,

        "Flow Packets/s":
            total_packets / duration if duration > 0 else 0,

        "Flow IAT Mean": flow_iat_mean,
        "Flow IAT Std": flow_iat_std,
        "Flow IAT Max": flow_iat_max,
        "Flow IAT Min": flow_iat_min,

        "Fwd IAT Total":
            max(flow["fwd_times"]) - min(flow["fwd_times"])
            if len(flow["fwd_times"]) > 1 else 0,

        "Fwd IAT Mean": fwd_iat_mean,
        "Fwd IAT Std": fwd_iat_std,
        "Fwd IAT Max": fwd_iat_max,
        "Fwd IAT Min": fwd_iat_min,

        "Bwd IAT Total":
            max(flow["bwd_times"]) - min(flow["bwd_times"])
            if len(flow["bwd_times"]) > 1 else 0,

        "Bwd IAT Mean": bwd_iat_mean,
        "Bwd IAT Std": bwd_iat_std,
        "Bwd IAT Max": bwd_iat_max,
        "Bwd IAT Min": bwd_iat_min,

        "Fwd PSH Flags": flow["psh_count"],
        "Bwd PSH Flags": 0,

        "Fwd URG Flags": flow["urg_count"],
        "Bwd URG Flags": 0,

        "Fwd Header Length":
            sum(flow["fwd_header_lengths"]),

        "Bwd Header Length":
            sum(flow["bwd_header_lengths"]),

        "Fwd Packets/s":
            flow["fwd_packets"] / duration
            if duration > 0 else 0,

        "Bwd Packets/s":
            flow["bwd_packets"] / duration
            if duration > 0 else 0,

        "Min Packet Length": packet_min,
        "Max Packet Length": packet_max,
        "Packet Length Mean": packet_mean,
        "Packet Length Std": packet_std,
        "Packet Length Variance": packet_variance,

        "FIN Flag Count": flow["fin_count"],
        "SYN Flag Count": flow["syn_count"],
        "RST Flag Count": flow["rst_count"],
        "PSH Flag Count": flow["psh_count"],
        "ACK Flag Count": flow["ack_count"],
        "URG Flag Count": flow["urg_count"],

        "CWE Flag Count": 0,
        "ECE Flag Count": 0,

        "Down/Up Ratio":
            flow["bwd_packets"] / flow["fwd_packets"]
            if flow["fwd_packets"] > 0 else 0,

        "Average Packet Size":
            packet_mean,

        "Avg Fwd Segment Size":
            fwd_mean,

        "Avg Bwd Segment Size":
            bwd_mean,

        "Fwd Header Length.1":
            sum(flow["fwd_header_lengths"]),

        "Fwd Avg Bytes/Bulk": 0,
        "Fwd Avg Packets/Bulk": 0,
        "Fwd Avg Bulk Rate": 0,

        "Bwd Avg Bytes/Bulk": 0,
        "Bwd Avg Packets/Bulk": 0,
        "Bwd Avg Bulk Rate": 0,

        "Subflow Fwd Packets":
            flow["fwd_packets"],

        "Subflow Fwd Bytes":
            flow["fwd_bytes"],

        "Subflow Bwd Packets":
            flow["bwd_packets"],

        "Subflow Bwd Bytes":
            flow["bwd_bytes"],

        "Init_Win_bytes_forward":
            flow["fwd_windows"][0]
            if flow["fwd_windows"] else 0,

        "Init_Win_bytes_backward":
            flow["bwd_windows"][0]
            if flow["bwd_windows"] else 0,

        "act_data_pkt_fwd": 0,

        "min_seg_size_forward": 0,

        "Active Mean": 0,
        "Active Std": 0,
        "Active Max": 0,
        "Active Min": 0,

        "Idle Mean": 0,
        "Idle Std": 0,
        "Idle Max": 0,
        "Idle Min": 0,
    }

    return features