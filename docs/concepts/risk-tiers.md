# Risk tiers (R1–R4)

> **Source of truth for:** the canonical definition of the 4 risk tiers.
> Every tool call is classified into one of these 4 tiers by the firewall's **Layer 1**.

## Tier definitions

### R1 · Low — Reversible

**Definition:** actions that only read information or query state without producing external effects. If executed by mistake, no harm is done.

**Examples:**
- Read emails from inbox
- Query records in a database
- List files in a directory
- Web searches
- Calls to read-only APIs
- Fetch a user's public profile

**Default behavior:** auto-approve, log only.

### R2 · Medium — External

**Definition:** actions that produce effects visible to third parties but are not critically irreversible. A single action can be reverted or compensated with reasonable effort.

**Examples:**
- Send an email
- Post on social networks
- Send a LinkedIn message
- Call an external webhook
- Create a record in CRM
- Schedule a calendar meeting

**Default behavior:** notify the user, 30-second cancellation window (configurable 0–120s).

### R3 · High — Irreversible

**Definition:** actions that modify or destroy information in a way that is not easily recoverable. They may require backup, snapshot, or manual intervention to revert.

**Examples:**
- Delete emails (batch > 1)
- Delete database records
- Modify system configuration
- Execute arbitrary code
- Modify files on disk
- Cancel subscriptions or services

**Default behavior:** block until explicit user approval.

### R4 · Critical — Sensitive

**Definition:** actions that touch personally identifiable information (PII), credentials, or produce direct economic effects. Mistakes here are potentially catastrophic.

**Examples:**
- Money transfers
- Purchases or payments
- Credential modification
- Sharing personal info with third parties
- Access permission changes
- Operations on personal medical or financial data

**Default behavior:** always block. Approval requires MFA. **Not relaxable without admin override.**

## Comparison table

| Tier | Level    | Reversible | External | Touches PII / money | Default                              |
| ---- | -------- | ---------- | -------- | ------------------- | ------------------------------------ |
| R1   | Low      | ✅         | ❌       | ❌                  | Auto-approve, log                    |
| R2   | Medium   | ⚠️         | ✅       | ❌                  | Notify + 30s cancellation            |
| R3   | High     | ❌         | ⚠️       | ❌                  | Block until approval                 |
| R4   | Critical | ❌         | ✅       | ✅                  | Block + MFA, not relaxable           |

## Classification rules

### Static rules (first pass)

Defined by the developer in YAML policies. Map tool name + parameters to a tier.

```yaml
tools:
  gmail.send:
    risk: R2

  gmail.delete:
    risk: R3
    when: { batch_size: { gt: 10 } }
    escalate_to: R4

  stripe.charge:
    risk: R4    # always critical
```

### Automatic escalation

An action can escalate tier based on context:

- `gmail.delete` with `batch_size <= 1` → stays at R3
- `gmail.delete` with `batch_size > 10` → escalates to R4
- `gmail.send` to `> 50` recipients → escalates to R3

### LLM classifier (fallback)

For tools not catalogued in static rules, AAF uses a lightweight LLM (Claude Haiku 4.5 or GPT-5 nano) that analyzes name and parameters and returns a suggested tier.

**Classifier prompt:**

```
Classify this tool call by reversibility, externality, and sensitivity.

Tool name: {tool_name}
Parameters: {sanitized_params}

Return JSON:
{
  "risk_tier": "R1" | "R2" | "R3" | "R4",
  "reasoning": "short explanation"
}

Be conservative: when in doubt, choose the higher tier.
```

The result is cached by `(tool_name, parameter_shape)` to avoid repeated latency.

## Configurability

The developer can:

- **Reassign tier** of any tool in YAML policies
- **Paranoid mode:** raise default behavior one tier (R1 → notify, R2 → block, etc.)
- **Admin override:** adjust R4 behavior (requires additional authentication)

## Design decisions

### Why 4 tiers and not more

3 tiers is too coarse (R3 would mix "delete 1 email" with "transfer $10,000"). 5+ tiers introduces ambiguity for the developer. 4 captures the decision space without overloading it.

### Why R4 is not relaxable

R4 includes actions where error cost is potentially catastrophic and irreversible. Allowing relaxation opens the door to unsafe configurations under productivity pressure. The friction is deliberate.

### Why the LLM classifier is fallback, not primary

- Latency: static rules resolve in microseconds. LLM takes ~100ms.
- Determinism: product behavior must be predictable. LLM introduces variability.
- Cost: classifying every action with LLM is not economically viable at scale.

The LLM is only invoked for uncatalogued tools, and the result is aggressively cached.

## References

- [Architecture — Layer 1](../architecture.md)
- Schema: [`/schemas/policy.schema.json`](../../schemas/policy.schema.json)
- ADR-0005: [4-tier risk structure](../adrs/0005-four-tier-risk.md)
