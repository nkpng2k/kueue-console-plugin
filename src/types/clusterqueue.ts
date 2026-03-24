import { K8sCondition, KueueResource } from './common';

export interface ResourceQuota {
  coveredResources?: string[];
  flavors?: FlavorQuota[];
}

export interface FlavorQuota {
  name: string;
  resources: ResourceUsage[];
}

export interface ResourceUsage {
  name: string;
  nominalQuota?: string;
  borrowingLimit?: string;
  lendingLimit?: string;
}

export interface FlavorUsage {
  name: string;
  resources: {
    name: string;
    total?: string;
    borrowed?: string;
  }[];
}

export interface AdmittedWorkloadsUsage {
  name: string;
  resources: {
    name: string;
    total?: string;
    borrowed?: string;
  }[];
}

export interface ClusterQueueSpec {
  cohort?: string;
  queueingStrategy?: 'StrictFIFO' | 'BestEffortFIFO';
  namespaceSelector?: {
    matchLabels?: Record<string, string>;
    matchExpressions?: {
      key: string;
      operator: string;
      values?: string[];
    }[];
  };
  resourceGroups?: {
    coveredResources: string[];
    flavors: FlavorQuota[];
  }[];
  preemption?: {
    reclaimWithinCohort?: 'Never' | 'LowerPriority' | 'Any';
    borrowWithinCohort?: {
      policy?: 'Never' | 'LowerPriority';
      maxPriorityThreshold?: number;
    };
    withinClusterQueue?: 'Never' | 'LowerPriority' | 'LowerOrNewerEqualPriority';
  };
  admissionChecks?: string[];
  stopPolicy?: 'None' | 'Hold' | 'HoldAndDrain';
  fairSharing?: {
    weight?: string;
  };
}

export interface ClusterQueueStatus {
  conditions?: K8sCondition[];
  flavorsReservation?: FlavorUsage[];
  flavorsUsage?: FlavorUsage[];
  admittedWorkloads?: number;
  pendingWorkloads?: number;
  reservingWorkloads?: number;
  pendingWorkloadsStatus?: {
    clusterQueuePendingWorkload?: {
      name: string;
      namespace: string;
    }[];
    lastChangeTime?: string;
  };
}

export interface ClusterQueue extends KueueResource {
  spec?: ClusterQueueSpec;
  status?: ClusterQueueStatus;
}
