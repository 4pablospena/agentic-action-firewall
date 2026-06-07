# AAF ML training pipeline

Synthetic bootstrap training for Layer 3 ONNX detector until beta telemetry is available.

## Setup

```bash
cd packages/ml
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Train

```bash
python generate_synthetic.py
python train.py
```

Output: `fixtures/anomaly-v1.onnx`

## CLI (from repo root)

```bash
pnpm aaf ml train --synthetic
pnpm aaf ml validate --model packages/ml/fixtures/anomaly-v1.onnx
```
