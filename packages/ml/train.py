from __future__ import annotations

import csv
from pathlib import Path

import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression

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


def load_dataset(path: Path) -> tuple[np.ndarray, np.ndarray]:
    rows: list[list[float]] = []
    labels: list[int] = []
    with path.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            rows.append([float(row[name]) for name in FEATURES])
            labels.append(int(row["label"]))
    return np.array(rows, dtype=np.float32), np.array(labels, dtype=np.int64)


def main() -> None:
    dataset = FIXTURES / "synthetic-anomaly.csv"
    if not dataset.exists():
        from generate_synthetic import main as generate_main

        generate_main()

    x_train, y_train = load_dataset(dataset)
    model = LogisticRegression(max_iter=1000)
    model.fit(x_train, y_train)

    onnx_model = convert_sklearn(
        model,
        initial_types=[("input", FloatTensorType([None, len(FEATURES)]))],
        options={id(model): {"zipmap": False}},
        target_opset=12,
    )

    output = FIXTURES / "anomaly-v1.onnx"
    with output.open("wb") as handle:
        handle.write(onnx_model.SerializeToString())

    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
