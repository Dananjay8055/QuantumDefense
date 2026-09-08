// Fallback & initial telemetry data for Quantum Defense SOC

export const MOCK_QSVC = {
  algorithm: "QSVC",
  status: "COMPLETED",
  dataset: "CICIDS2017",
  dataset_path: "../datasets/processed/cicids2017_clean.csv",
  sample_size: 600,
  training_samples: 450,
  testing_samples: 150,
  qubits: 4,
  feature_map: "ZZFeatureMap",
  entanglement: "linear",
  kernel: "FidelityQuantumKernel",
  classifier: "QSVC",
  features: [
    "Average Packet Size",
    "Packet Length Variance",
    "Subflow Bwd Bytes",
    "Total Length of Fwd Packets"
  ],
  test_size: 0.25,
  random_state: 42,
  experiments: [
    {
      reps: 1,
      accuracy: 0.886667,
      precision: 0.9,
      recall: 0.36,
      f1: 0.514286,
      confusion_matrix: [
        [124, 1],
        [16, 9]
      ],
      training_time_seconds: 655.03,
      prediction_time_seconds: 438.21
    },
    {
      reps: 2,
      accuracy: 0.886667,
      precision: 0.833333,
      recall: 0.4,
      f1: 0.540541,
      confusion_matrix: [
        [123, 2],
        [15, 10]
      ],
      training_time_seconds: 986.65,
      prediction_time_seconds: 658.06
    }
  ]
};

export const MOCK_CIRCUIT = {
  algorithm: "QSVC",
  classifier: "QSVC",
  feature_map: "ZZFeatureMap",
  kernel: "FidelityQuantumKernel",
  qubits: 4,
  features: [
    "Average Packet Size",
    "Packet Length Variance",
    "Subflow Bwd Bytes",
    "Total Length of Fwd Packets"
  ],
  experiments: [
    {
      reps: 1,
      qubits: 4,
      width: 4,
      depth: 6,
      entanglement: "linear",
      operations: { rz: 8, h: 4, cx: 6 },
      circuit: "q_0: ──[H]──[Rz(x[0])]──■──────■──────────────────\n                      │      │                  \nq_1: ──[H]──[Rz(x[1])]──■──┼───■──────■───────────\n                            │          │           \nq_2: ──[H]──[Rz(x[2])]──────■──┼───────■──■───────■\n                               │          │       │\nq_3: ──[H]──[Rz(x[3])]─────────■──────────■──[Rz]─■"
    },
    {
      reps: 2,
      qubits: 4,
      width: 4,
      depth: 12,
      entanglement: "linear",
      operations: { rz: 16, h: 8, cx: 12 },
      circuit: "q_0: ──[H]──[Rz]──■──■──[H]──[Rz]──■──■───────\nq_1: ──[H]──[Rz]──■──┼──[H]──[Rz]──■──┼───────\nq_2: ──[H]──[Rz]──┼──■──[H]──[Rz]──┼──■───────\nq_3: ──[H]──[Rz]──■──■──[H]──[Rz]──■──■───────"
    }
  ]
};

export const MOCK_PQC = {
  status: "PQC operational",
  result: {
    algorithm: "ML-KEM-768",
    claimed_nist_level: 3,
    shared_secret_match: true,
    status: "SUCCESS",
    latency_ms: 0.42,
    entropy_bits: 256,
    public_key_bytes: 1184,
    ciphertext_bytes: 1088
  }
};

export const MOCK_BLOCKCHAIN = {
  valid: true,
  length: 3,
  chain: [
    {
      index: 0,
      timestamp: 1773024000,
      event: "GENESIS",
      previous_hash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: "8f43a8820c7e2d9b6238b9195a6f2cf1975e53e4cbb45413554e20793674cf30"
    },
    {
      index: 1,
      timestamp: 1773024320,
      event: {
        type: "SECURITY_EVENT",
        source: "192.168.1.104",
        destination: "10.0.0.1",
        protocol: "TCP",
        severity: "HIGH",
        attack_probability: 0.85,
        prediction: 1,
        qaoa_action: "BLOCK_SOURCE",
        qaoa_score: 0.912,
        algorithm: "QAOA",
        classical_optimal_action: "BLOCK_SOURCE",
        qaoa_matches_classical: true,
        mitigation_action: "BLOCK_SOURCE",
        mitigation_status: "SUCCESS",
        mitigation_message: "Automated firewall rule appended via Post-Quantum RPC",
        pqc_algorithm: "ML-KEM-768",
        pqc_status: "SUCCESS",
        pqc_shared_secret_match: true,
        pqc_nist_level: 3
      },
      previous_hash: "8f43a8820c7e2d9b6238b9195a6f2cf1975e53e4cbb45413554e20793674cf30",
      hash: "3b2e7a199f57d6e42b10c9a4e8d35688a2ef4901b0f19c34d8e57620bcfa7812"
    },
    {
      index: 2,
      timestamp: 1773024780,
      event: {
        type: "SECURITY_EVENT",
        source: "192.168.1.118",
        destination: "10.0.0.5",
        protocol: "UDP",
        severity: "CRITICAL",
        attack_probability: 0.98,
        prediction: 1,
        qaoa_action: "ISOLATE_HOST",
        qaoa_score: 0.967,
        algorithm: "QAOA",
        classical_optimal_action: "ISOLATE_HOST",
        qaoa_matches_classical: true,
        mitigation_action: "ISOLATE_HOST",
        mitigation_status: "SUCCESS",
        mitigation_message: "VLAN quarantine enforced, PQC key re-established",
        pqc_algorithm: "ML-KEM-768",
        pqc_status: "SUCCESS",
        pqc_shared_secret_match: true,
        pqc_nist_level: 3
      },
      previous_hash: "3b2e7a199f57d6e42b10c9a4e8d35688a2ef4901b0f19c34d8e57620bcfa7812",
      hash: "a4c87126eb390f1d5e2a9b3487c6f01193d258ea674b890f145c22998ab31df5"
    }
  ]
};

export const MOCK_DETECTIONS = [
  {
    flow: ["192.168.1.45", "10.0.0.2", 54321, 443, "TCP"],
    result: { prediction: 0, probability_benign: 0.96, probability_attack: 0.04 },
    severity: "BENIGN",
    type: "LIVE_FLOW",
    timestamp: 1773024100
  },
  {
    flow: ["192.168.1.88", "10.0.0.3", 49152, 80, "TCP"],
    result: { prediction: 0, probability_benign: 0.92, probability_attack: 0.08 },
    severity: "BENIGN",
    type: "LIVE_FLOW",
    timestamp: 1773024180
  },
  {
    flow: ["10.0.1.15", "10.0.0.1", 38920, 53, "UDP"],
    result: { prediction: 0, probability_benign: 0.89, probability_attack: 0.11 },
    severity: "BENIGN",
    type: "LIVE_FLOW",
    timestamp: 1773024220
  },
  {
    flow: ["192.168.1.104", "10.0.0.1", 4444, 8080, "TCP"],
    result: { prediction: 1, probability_benign: 0.15, probability_attack: 0.85 },
    severity: "HIGH",
    type: "SIMULATED_ATTACK",
    timestamp: 1773024320,
    response: {
      action: "BLOCK_SOURCE",
      score: 0.912,
      algorithm: "QAOA",
      variables: [0, 0, 1, 0],
      classical_optimal_action: "BLOCK_SOURCE",
      qaoa_matches_classical: true,
      response_scores: {
        MONITOR: 0.12,
        RATE_LIMIT: 0.48,
        BLOCK_SOURCE: 0.912,
        ISOLATE_HOST: 0.76
      }
    },
    mitigation: {
      action: "BLOCK_SOURCE",
      source: "192.168.1.104",
      destination: "10.0.0.1",
      status: "EXECUTED",
      message: "Automated firewall rule applied to block source IP"
    },
    pqc: {
      algorithm: "ML-KEM-768",
      claimed_nist_level: 3,
      shared_secret_match: true,
      status: "SUCCESS"
    }
  },
  {
    flow: ["192.168.1.72", "10.0.0.8", 61002, 22, "SSH"],
    result: { prediction: 0, probability_benign: 0.94, probability_attack: 0.06 },
    severity: "BENIGN",
    type: "LIVE_FLOW",
    timestamp: 1773024400
  },
  {
    flow: ["172.16.0.42", "10.0.0.1", 55210, 443, "TLS"],
    result: { prediction: 0, probability_benign: 0.97, probability_attack: 0.03 },
    severity: "BENIGN",
    type: "LIVE_FLOW",
    timestamp: 1773024500
  },
  {
    flow: ["192.168.1.118", "10.0.0.5", 4444, 445, "SMB"],
    result: { prediction: 1, probability_benign: 0.02, probability_attack: 0.98 },
    severity: "CRITICAL",
    type: "SIMULATED_ATTACK",
    timestamp: 1773024780,
    response: {
      action: "ISOLATE_HOST",
      score: 0.967,
      algorithm: "QAOA",
      variables: [0, 0, 0, 1],
      classical_optimal_action: "ISOLATE_HOST",
      qaoa_matches_classical: true,
      response_scores: {
        MONITOR: 0.05,
        RATE_LIMIT: 0.32,
        BLOCK_SOURCE: 0.81,
        ISOLATE_HOST: 0.967
      }
    },
    mitigation: {
      action: "ISOLATE_HOST",
      source: "192.168.1.118",
      destination: "10.0.0.5",
      status: "EXECUTED",
      message: "Quarantine protocol invoked: isolated host from internal subnet"
    },
    pqc: {
      algorithm: "ML-KEM-768",
      claimed_nist_level: 3,
      shared_secret_match: true,
      status: "SUCCESS"
    }
  }
];
