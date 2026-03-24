# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenShift Console dynamic plugin for **Red Hat Build of Kueue** — a Kubernetes-native job queueing system for managing batch workloads, AI/ML jobs, and HPC workloads with resource quotas, fair sharing, and multi-tenancy.

## Build and Development Commands

```bash
yarn install --immutable    # Install dependencies (requires corepack/yarn 4.13.0)
yarn build                  # Production build
yarn build-dev              # Development build
yarn start                  # Dev server on localhost:9001
yarn lint                   # ESLint + StyleLint with auto-fix
yarn typecheck              # TypeScript type checking
yarn test                   # Jest unit tests
yarn start-console          # Run OpenShift console locally (requires oc + podman/docker)
yarn test-cypress           # Open Cypress for interactive E2E testing
yarn test-cypress-headless  # Run Cypress headlessly
```

## Architecture

This is a webpack module federation plugin loaded dynamically by the OpenShift console.

### Key Concepts
- **consolePlugin** in `package.json` — plugin metadata and exposed modules
- **console-extensions.json** — declares extension points (nav items, pages, actions)
- **webpack.config.ts** — uses `ConsoleRemotePlugin` from `@openshift-console/dynamic-plugin-sdk-webpack`
- All React deps are shared by the console at runtime (not bundled)

### Source Structure
- `src/types/` — TypeScript types for Kueue CRDs (ClusterQueue, LocalQueue, Workload, ResourceFlavor)
- `src/hooks/` — Data access hooks wrapping `useK8sWatchResource` from the console SDK
- `src/utils/` — Helpers for workload phase detection, quota calculations, diagnostics
- `src/components/clusterqueues/` — ClusterQueue list and detail pages
- `src/components/localqueues/` — LocalQueue list and detail pages
- `src/components/workloads/` — Workload list, detail, and "Why Am I Waiting?" diagnostic panel
- `src/components/resourceflavors/` — ResourceFlavor list and detail pages
- `src/components/dashboard/` — Overview dashboard with health, utilization, pending workload cards
- `src/components/shared/` — Shared components (StatusBadge, ConditionsTable, QuotaBar, ErrorBoundary)

### Kueue Resources (kueue.x-k8s.io/v1beta1)
- **ClusterQueue** — cluster-scoped resource pool with quotas (admin manages)
- **LocalQueue** — namespace-scoped submission point (users submit to these)
- **Workload** — unit of admission (typically a Job)
- **ResourceFlavor** — resource variations (GPU types, spot vs. on-demand)

### Deployment
- Dockerfile: multi-stage build (UBI9 nodejs-22 → nginx-120)
- Helm chart in `charts/kueue-console-plugin/`
- ConsolePlugin CR registers the plugin with OpenShift

## Conventions
- Use PatternFly 6 components exclusively — no other CSS frameworks
- Use PatternFly CSS variables — never hex colors (dark mode support)
- Prefix CSS classes with `kueue-console-plugin__` to avoid collisions
- i18n namespace: `plugin__kueue-console-plugin` (must match `consolePlugin.name`)
- Wrap every major view in `<ErrorBoundary>` for graceful failure handling
- Use `useAccessReview` from the SDK to gate admin-only actions
- All data access goes through console SDK hooks (useK8sWatchResource, usePrometheusPoll)
