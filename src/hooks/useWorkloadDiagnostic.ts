import { useMemo } from 'react';
import { Workload, ClusterQueue, LocalQueue } from '../types';
import { useClusterQueues, useLocalQueues } from './useKueueResources';
import {
  getWorkloadPhase,
  getWorkloadTotalResources,
  getClusterQueueAvailableQuota,
} from '../utils/kueue-helpers';

export interface WorkloadDiagnostic {
  reason: string;
  queuePosition: number | null;
  estimatedWaitMinutes: number | null;
  requestedResources: Record<string, string>;
  availableResources: Record<string, string>;
  suggestions: string[];
  localQueue: LocalQueue | undefined;
  clusterQueue: ClusterQueue | undefined;
}

export const useWorkloadDiagnostic = (workload: Workload | undefined): WorkloadDiagnostic | null => {
  const { clusterQueues } = useClusterQueues();
  const { localQueues } = useLocalQueues();

  return useMemo(() => {
    if (!workload) return null;

    const phase = getWorkloadPhase(workload);
    if (phase === 'Admitted' || phase === 'Running' || phase === 'Finished') {
      return null;
    }

    const localQueue = localQueues?.find(
      (lq) =>
        lq.metadata?.name === workload.spec?.queueName &&
        lq.metadata?.namespace === workload.metadata?.namespace,
    );

    const clusterQueue = clusterQueues?.find(
      (cq) => cq.metadata?.name === localQueue?.spec?.clusterQueue,
    );

    const requested = getWorkloadTotalResources(workload);
    const available = clusterQueue ? getClusterQueueAvailableQuota(clusterQueue) : {};

    const pendingCount = clusterQueue?.status?.pendingWorkloads ?? 0;

    const reason = buildReason(workload, localQueue, clusterQueue, requested, available);
    const suggestions = buildSuggestions(workload, localQueue, clusterQueue, requested, available);

    return {
      reason,
      queuePosition: pendingCount > 0 ? pendingCount : null,
      estimatedWaitMinutes: null, // requires historical data from Prometheus
      requestedResources: requested,
      availableResources: available,
      suggestions,
      localQueue,
      clusterQueue,
    };
  }, [workload, clusterQueues, localQueues]);
};

function buildReason(
  workload: Workload,
  localQueue: LocalQueue | undefined,
  clusterQueue: ClusterQueue | undefined,
  requested: Record<string, string>,
  available: Record<string, string>,
): string {
  if (!localQueue) {
    const queueName = workload.spec?.queueName;
    return queueName
      ? `LocalQueue "${queueName}" not found in namespace "${workload.metadata?.namespace}".`
      : 'No queue name specified on this workload.';
  }

  const activeCondition = localQueue.status?.conditions?.find((c) => c.type === 'Active');
  if (activeCondition?.status === 'False') {
    return `LocalQueue "${localQueue.metadata?.name}" is not active: ${activeCondition.message || activeCondition.reason || 'unknown reason'}.`;
  }

  if (!clusterQueue) {
    return `ClusterQueue "${localQueue.spec?.clusterQueue}" referenced by LocalQueue "${localQueue.metadata?.name}" was not found.`;
  }

  if (clusterQueue.spec?.stopPolicy && clusterQueue.spec.stopPolicy !== 'None') {
    return `ClusterQueue "${clusterQueue.metadata?.name}" is paused (stopPolicy: ${clusterQueue.spec.stopPolicy}).`;
  }

  const insufficientResources: string[] = [];
  for (const [resource, requestedAmount] of Object.entries(requested)) {
    const availableAmount = available[resource];
    if (availableAmount !== undefined) {
      insufficientResources.push(
        `${resource}: requested ${requestedAmount}, available ${availableAmount}`,
      );
    }
  }

  if (insufficientResources.length > 0) {
    return `Insufficient quota in ClusterQueue "${clusterQueue.metadata?.name}": ${insufficientResources.join('; ')}.`;
  }

  const pending = clusterQueue.status?.pendingWorkloads ?? 0;
  if (pending > 1) {
    return `Waiting in queue. There are ${pending} pending workloads in ClusterQueue "${clusterQueue.metadata?.name}".`;
  }

  return 'Workload is pending admission. Check conditions for more details.';
}

function buildSuggestions(
  _workload: Workload,
  localQueue: LocalQueue | undefined,
  clusterQueue: ClusterQueue | undefined,
  _requested: Record<string, string>,
  _available: Record<string, string>,
): string[] {
  const suggestions: string[] = [];

  if (!localQueue) {
    suggestions.push(
      'Verify the queue name label on your workload matches an existing LocalQueue in this namespace.',
    );
    return suggestions;
  }

  if (!clusterQueue) {
    suggestions.push(
      'Contact your cluster administrator to verify the ClusterQueue configuration.',
    );
    return suggestions;
  }

  if (clusterQueue.spec?.stopPolicy && clusterQueue.spec.stopPolicy !== 'None') {
    suggestions.push(
      'The ClusterQueue is paused. Contact your cluster administrator to resume it.',
    );
  }

  const pending = clusterQueue.status?.pendingWorkloads ?? 0;
  if (pending > 1) {
    suggestions.push('Consider reducing resource requests to be admitted sooner.');
    if (clusterQueue.spec?.cohort) {
      suggestions.push(
        `This queue is part of cohort "${clusterQueue.spec.cohort}" — resources may become available through borrowing.`,
      );
    }
  }

  return suggestions;
}
