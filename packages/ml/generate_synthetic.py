from __future__ import annotations

import csv
from pathlib import Path

FEATURES = [
    "mass_action_count_60s",
    "loop_sequence_count",
    "mean_interval_ms",
    "max_similarity",
    "recipients_unique_1h",
    "batch_size",
    "payload_size_bytes",
    "destructive_tool",
    "external_action",
]

FIXTURES = Path(__file__).resolve().parent / "fixtures"


def main() -> None:
    FIXTURES.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, float | int]] = []

    for _ in range(200):
        rows.append(
            {
                **{name: 0 for name in FEATURES},
                "label": 0,
            }
        )

    incident_cases = [
        {
            "mass_action_count_60s": 60,
            "loop_sequence_count": 4,
            "mean_interval_ms": 500,
            "max_similarity": 0.2,
            "recipients_unique_1h": 3,
            "batch_size": 50,
            "payload_size_bytes": 100,
            "destructive_tool": 1,
            "external_action": 1,
            "label": 1,
        },
        {
            "mass_action_count_60s": 5,
            "loop_sequence_count": 6,
            "mean_interval_ms": 200,
            "max_similarity": 0.95,
            "recipients_unique_1h": 20,
            "batch_size": 1,
            "payload_size_bytes": 500,
            "destructive_tool": 0,
            "external_action": 1,
            "label": 1,
        },
    ]

    rows.extend(incident_cases)

    output = FIXTURES / "synthetic-anomaly.csv"
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=[*FEATURES, "label"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
