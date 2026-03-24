import { ClusterQueue, Workload, WorkloadPhase } from '../types';

export function getWorkloadPhase(workload: Workload): WorkloadPhase {
  const conditions = workload.status?.conditions ?? [];

  const finished = conditions.find((c) => c.type === 'Finished');
  if (finished?.status === 'True') return 'Finished';

  const evicted = conditions.find((c) => c.type === 'Evicted');
  if (evicted?.status === 'True') return 'Evicted';

  const admitted = conditions.find((c) => c.type === 'Admitted');
  if (admitted?.status === 'True') return 'Admitted';

  const quotaReserved = conditions.find((c) => c.type === 'QuotaReserved');
  if (quotaReserved?.status === 'True') return 'QuotaReserved';

  if (workload.spec?.active === false) return 'Pending';

  return 'Pending';
}

export function getWorkloadTotalResources(workload: Workload): Record<string, string> {
  const resources: Record<string, string> = {};

  for (const podSet of workload.spec?.podSets ?? []) {
    for (const container of podSet.template?.spec?.containers ?? []) {
      const requests = container.resources?.requests ?? {};
      for (const [name, value] of Object.entries(requests)) {
        resources[name] = resources[name]
          ? addResourceValues(resources[name], value)
          : `${podSet.count}x ${value}`;
      }
    }
  }

  return resources;
}

function addResourceValues(existing: string, additional: string): string {
  return `${existing} + ${additional}`;
}

export function getClusterQueueAvailableQuota(
  clusterQueue: ClusterQueue,
): Record<string, string> {
  const available: Record<string, string> = {};

  for (const rg of clusterQueue.spec?.resourceGroups ?? []) {
    for (const flavor of rg.flavors) {
      for (const resource of flavor.resources) {
        const key = `${resource.name} (${flavor.name})`;
        available[key] = resource.nominalQuota ?? '0';
      }
    }
  }

  return available;
}

export function getClusterQueueHealthStatus(
  clusterQueue: ClusterQueue,
): 'healthy' | 'warning' | 'error' | 'unknown' {
  const activeCondition = clusterQueue.status?.conditions?.find((c) => c.type === 'Active');

  if (!activeCondition) return 'unknown';
  if (activeCondition.status === 'False') return 'error';

  if (clusterQueue.spec?.stopPolicy && clusterQueue.spec.stopPolicy !== 'None') {
    return 'warning';
  }

  const pending = clusterQueue.status?.pendingWorkloads ?? 0;
  if (pending > 10) return 'warning';

  return 'healthy';
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function getTimeSince(timestamp: string | undefined): string {
  if (!timestamp) return '-';
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const seconds = Math.floor((now - then) / 1000);
  return formatDuration(seconds);
}
