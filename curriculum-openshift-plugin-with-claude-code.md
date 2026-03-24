# Building OpenShift Console Dynamic Plugins with Claude Code

A step-by-step curriculum for using Claude Code to create production-quality OpenShift console dynamic plugins for your operators.

## Prerequisites

- Access to an OpenShift cluster (4.15+) with `oc` CLI logged in
- Node.js and Docker/Podman installed locally
- Claude Code CLI installed
- An operator installed on the cluster that you want to build a plugin for

---

## Phase 1: Planning and Architecture

### Prompt 1: Initial Scaffold with Multi-Agent Analysis

Start by telling Claude Code what operator/product you're building a plugin for. Request multiple specialized agents to get well-rounded recommendations before writing any code.

```
I want to build a dynamic plugin for the OpenShift console. This plugin is for
[YOUR OPERATOR NAME]. I want you to analyze the codebase and recommend the best
possible user experience.

Let's spin up a couple different agents:
- A UX agent to design the optimal user experience
- An architect agent to design the technical structure
- A system admin / cluster admin agent to be the consumer of the plugin

Get feedback from all agents. Use the openshift/console-plugin-template as the
starting point.
```

**What this does:** Launches three parallel research agents that analyze your operator's CRDs, typical user workflows, and the OpenShift plugin SDK. Each agent provides a different perspective — UX focuses on information hierarchy and interactions, the architect focuses on component structure and data access patterns, and the sysadmin provides the "what do I actually need to see" practitioner viewpoint.

### Prompt 2: Security Review

```
Spin up a security agent to make sure that we use correct libraries and images
and do not introduce security vulnerabilities.
```

**What this does:** Audits the planned dependencies, container base images, RBAC configuration, CSP headers, and build pipeline for security best practices. Catches issues like using non-UBI base images, overly permissive RBAC, or missing security headers.

### Prompt 3: Production Quality Gate

```
Spin up an agent that will ensure that this will be a production quality plugin.
```

**What this does:** Defines measurable quality standards — code coverage targets, performance benchmarks, accessibility requirements, testing strategy, CI/CD gates, and operational readiness criteria.

### Prompt 4: Expert Review

Switch to a more capable model for critical review of the plan before implementation begins.

```
/model opus

Have opus review the plan.
```

**What this does:** A more capable model critically reviews the plan, finding issues the original model missed — wrong package managers, incorrect API usage, unrealistic timelines, missing error handling patterns, or outdated dependencies. Produces a documented audit trail of issues found and fixes applied.

---

## Phase 2: Build and Deploy

### Prompt 5: Build and Deploy

Once the plan is approved, have Claude Code execute the entire build-deploy pipeline.

```
I have already logged into oc for this terminal. Go build this and deploy it.
```

**What this does:** Claude Code will:
1. Set up the package manager (yarn via corepack)
2. Install dependencies
3. Run the build (and fix any compilation errors)
4. Create an OpenShift BuildConfig for in-cluster builds
5. Build and push the container image
6. Deploy via Helm chart
7. Register the ConsolePlugin CR
8. Enable the plugin in the console operator

### Prompt 6: Install Your Operator (if needed)

If your operator isn't already installed on the cluster:

```
[YOUR OPERATOR] is not installed. Install it on the OpenShift cluster.
```

**What this does:** Claude Code will find your operator in the OperatorHub, install any required dependencies (like cert-manager), create the operator subscription, wait for it to become ready, and create sample resources so the plugin has data to display.

---

## Phase 3: Iterate and Improve

### Prompt 7: Design Review and Improvement

Once the plugin is running, identify areas to improve and request targeted design reviews.

```
Let's spin up an agent to do a design review. The [SPECIFIC PAGE/COMPONENT] is
very plain. Can you improve it?
```

**What this does:** Launches a specialized design review agent that analyzes the current implementation and proposes specific PatternFly component improvements. The agent provides exact component hierarchies, data sources, and interaction patterns — then Claude Code implements the changes, rebuilds, and redeploys.

### Prompt 8: Add New Features

```
Add a [FEATURE DESCRIPTION] to the [PAGE NAME]. It should show [SPECIFIC DATA]
and allow [SPECIFIC ACTIONS].
```

### Prompt 9: Fix Issues

```
When I navigate to [PAGE], I see [PROBLEM]. Fix this.
```

---

## Tips for Effective Prompting

### Be specific about your operator's domain
Instead of "build a plugin", say "build a plugin for Red Hat Build of Kueue that manages ClusterQueues, LocalQueues, Workloads, and ResourceFlavors". The more domain context you provide, the better the UX and architecture decisions.

### Use plan mode for complex changes
Type `/plan` before describing large features. This forces Claude Code to research and design before implementing, catching issues early.

### Let agents specialize
Each agent type brings a unique perspective. The UX agent catches information hierarchy issues, the architect catches technical debt, the sysadmin catches real-world usability gaps, the security agent catches vulnerabilities, and the production quality agent catches operational gaps.

### Request the model review its own work
Switching to a more capable model (`/model opus`) for review catches subtle issues that the implementation model missed — wrong API versions, deprecated components, unrealistic scope estimates.

### Iterate in small loops
After each deployment, check the console in your browser, then come back to Claude Code with specific feedback. "The dashboard shows X but I expected Y" is more effective than "make it better".

---

## Common Customization Points

When adapting this curriculum for your operator, replace these with your specifics:

| Placeholder | Example |
|---|---|
| `[YOUR OPERATOR NAME]` | Red Hat Build of Kueue |
| `[CRD NAMES]` | ClusterQueue, LocalQueue, Workload, ResourceFlavor |
| `[API GROUP]` | kueue.x-k8s.io |
| `[API VERSION]` | v1beta1 |
| `[OPERATOR NAMESPACE]` | openshift-kueue-operator |
| `[PLUGIN NAMESPACE]` | kueue-console-plugin |
| `[TARGET USERS]` | Cluster admins, data scientists, team leads |
| `[KEY WORKFLOWS]` | Queue management, workload monitoring, quota visualization |

---

## What Gets Created

By the end of this curriculum, you'll have:

- A complete OpenShift console dynamic plugin project scaffolded from the official template
- TypeScript types matching your operator's CRDs
- List and detail pages for each custom resource
- A dashboard with summary statistics, health indicators, and activity feeds
- Shared components (status badges, conditions tables, quota visualizations)
- Error boundaries wrapping every major view
- RBAC-aware UI (admin actions hidden for non-admin users)
- Multi-stage Dockerfile with UBI base images
- Helm chart with security hardening (non-root, seccomp, drop-all-caps)
- ConsolePlugin CR for automatic registration
- CI/CD pipeline configuration
- i18n setup for localization
- The plugin deployed and running on your cluster
