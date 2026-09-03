---
title: 09 Load and Soak Test
tags:
  - sdlc
  - sdlc-stage
stage_key: load-test
skill: load-test-scenario
skill_status: build
automation_level: B
created: 2026-09-03
status: blueprint
---

# 09 Load and Soak Test

Part of [[SDLC Agentic Workflow]]. Owning skill: **`load-test-scenario`** — *to build*. Level **B**.

## Purpose

Design the load and soak scenarios from the non-functional requirements, and record the result against the pass thresholds agreed *before* the run.

## Entry criteria

- SIT gate passed
- Non-functional requirements stated in the requirement or design note
- Production baseline volumes available

## Inputs

| Input | Source |
|---|---|
| Expected transaction volumes | Requirement note NFR section, production baseline |
| Peak profile | When does the ward day peak? Batch windows? |
| Latency / throughput targets | NFR section |
| Resource limits | OpenShift deployment limits — `LIS/ECP/OpenShift/` |
| Endpoints and jobs under test | `06 Code Change Log.md` |

## Scenario design

The skill produces scenarios, not a tool script — the runner (JMeter, k6, a bespoke harness) stays your choice, and the note states which was used.

| Scenario type | Shape | Answers |
|---|---|---|
| Baseline | Expected peak, 15–30 min | Does it meet the target under normal peak? |
| Stress | Ramp to failure | Where does it break, and how? |
| Soak | Expected peak, 4–24 h | Memory leak, connection-pool leak, unbounded queue growth |
| Spike | Sudden burst, then normal | Recovery behaviour, backlog drain rate |
| Failover | Pod restart / DB failover mid-load | Retry, idempotency, message loss |

Each scenario names: load profile, duration, data set, monitored metrics, and the **pass threshold agreed before the run**.

> [!important] Thresholds first
> Write the pass thresholds into the note and get them agreed before executing. A threshold decided after seeing the numbers is not a threshold.

## Monitored metrics

Response time p50/p95/p99 · throughput · error rate · JVM heap and GC pause · DB connection pool utilisation and wait time · thread pool saturation · OpenShift pod CPU/memory against limits · queue depth over time (the soak signal) · slow-query log.

## Output

`SDLC/Projects/<key>/09 Load Test Scenario.md` — scenarios, thresholds, execution log, result tables, charts in `assets/`, and a verdict per scenario with a tuning-recommendation section.

## Exit gate

- [ ] Every scenario executed or explicitly waived with a reason
- [ ] All thresholds met, or a breach is accepted in writing with a mitigation
- [ ] Soak shows no unbounded growth in heap, connections or queue depth
- [ ] Any resource-limit or pool-size change discovered here is fed back into stage 10's configuration list

## Human checkpoint

**Required** to set thresholds and to accept a breach.

## Notes

- The most common real finding at this stage is a connection-pool or thread-pool setting that needs to change in the ConfigMap. That is a stage 10 artifact, so wire the feedback loop explicitly — the orchestrator should prompt "does this change the promotion configuration list?" whenever this gate closes.
