# Kueue Console Plugin

OpenShift Console dynamic plugin for **Red Hat Build of Kueue** — manage workload queues, quotas, and resource allocation directly from the OpenShift web console.

## Features

- **Overview Dashboard** — summary statistics, queue health, resource utilization, recent activity feed, and pending workloads table with conditional alert banners
- **ClusterQueue Management** — list and detail views with quota visualization, cohort grouping, pause/resume actions (RBAC-gated)
- **LocalQueue Management** — namespace-scoped list and detail views with ClusterQueue links
- **Workload Monitoring** — list with phase badges, detail view with conditions, and **"Why Am I Waiting?"** diagnostic panel that explains in plain English why a workload is pending with actionable suggestions
- **ResourceFlavor Browser** — view node labels, taints, and tolerations for each flavor
- **Error Boundaries** — graceful failure handling on every major view
- **Dark Mode** — full support via PatternFly CSS tokens (no hardcoded colors)

## Prerequisites

- OpenShift 4.15+
- Red Hat Build of Kueue operator installed
- Node.js 20+ and [corepack](https://nodejs.org/api/corepack.html) enabled (for development)

## Quick Start (Development)

```bash
# Enable yarn via corepack
corepack enable && corepack prepare yarn@4.13.0 --activate

# Install dependencies
yarn install --immutable

# Start dev server (serves plugin on localhost:9001)
yarn start

# Run against a live cluster (requires oc login + podman/docker)
yarn start-console
```

## Build and Deploy to OpenShift

```bash
# Login to your cluster
oc login ...

# Create a namespace for the plugin
oc new-project kueue-console-plugin

# Create a build config and build the image in-cluster
oc new-build --binary --name=kueue-console-plugin --strategy=docker
oc start-build kueue-console-plugin --from-dir=. --follow --wait

# Deploy via Helm
helm install kueue-console-plugin ./charts/kueue-console-plugin \
  --namespace kueue-console-plugin \
  --set plugin.image=image-registry.openshift-image-registry.svc:5000/kueue-console-plugin/kueue-console-plugin:latest

# Enable the plugin in the console
oc patch consoles.operator.openshift.io cluster \
  --type=merge \
  --patch '{"spec":{"plugins":["kueue-console-plugin"]}}'
```

The plugin will appear in the OpenShift console under **Workload Management** in the Admin perspective sidebar.

## Development Commands

| Command | Description |
|---|---|
| `yarn install --immutable` | Install dependencies |
| `yarn build` | Production build |
| `yarn build-dev` | Development build |
| `yarn start` | Dev server on localhost:9001 |
| `yarn lint` | ESLint + StyleLint with auto-fix |
| `yarn typecheck` | TypeScript type checking |
| `yarn test` | Jest unit tests |
| `yarn start-console` | Run OpenShift console locally |
| `yarn test-cypress` | Open Cypress for interactive E2E testing |
| `yarn test-cypress-headless` | Run Cypress headlessly |

## Architecture

```
src/
├── components/
│   ├── clusterqueues/     # ClusterQueue list + detail pages
│   ├── localqueues/       # LocalQueue list + detail pages
│   ├── workloads/         # Workload list + detail + diagnostic panel
│   ├── resourceflavors/   # ResourceFlavor list + detail pages
│   ├── dashboard/         # Overview dashboard with 5-section layout
│   └── shared/            # StatusBadge, ConditionsTable, QuotaBar, ErrorBoundary
├── hooks/                 # useK8sWatchResource wrappers for all Kueue CRDs
├── types/                 # TypeScript types matching Kueue v1beta1 API
└── utils/                 # Workload phase detection, quota calculations, diagnostics
```

**Key integration points:**
- `console-extensions.json` — declares navigation items, page routes, and resource pages
- `package.json` `consolePlugin` section — plugin metadata and exposed modules
- `webpack.config.ts` — ConsoleRemotePlugin for module federation

## Tech Stack

- **React 17** with TypeScript strict mode
- **PatternFly 6** for all UI components
- **OpenShift Console SDK** (`@openshift-console/dynamic-plugin-sdk` 4.21)
- **Webpack 5** with module federation
- **yarn 4.13.0** (via corepack)

## Container Image

Multi-stage build using Red Hat UBI base images:
- **Builder:** `ubi9/nodejs-22`
- **Production:** `ubi9/nginx-120`
- Runs as non-root (UID 1001)
- Security hardened: seccomp, drop-all-caps, no privilege escalation

## Helm Chart

The Helm chart in `charts/kueue-console-plugin/` includes:
- Deployment with rolling updates and security context
- Service with OpenShift auto-generated TLS certificates
- ConsolePlugin CR for automatic registration
- ConfigMap with nginx config and security headers
- ServiceAccount with minimal permissions

## How This Was Built

This plugin was built entirely using [Claude Code](https://claude.ai/code) with a multi-agent approach. See [`curriculum-openshift-plugin-with-claude-code.md`](curriculum-openshift-plugin-with-claude-code.md) for a step-by-step guide on how to use Claude Code to build your own OpenShift console dynamic plugin for any operator.

## License

Apache-2.0
