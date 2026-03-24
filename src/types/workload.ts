import { K8sCondition, KueueResource } from './common';

export interface PodSet {
  name: string;
  count: number;
  template: {
    spec: {
      containers: {
        name: string;
        resources?: {
          requests?: Record<string, string>;
          limits?: Record<string, string>;
        };
      }[];
      nodeSelector?: Record<string, string>;
      tolerations?: {
        key?: string;
        operator?: string;
        value?: string;
        effect?: string;
      }[];
    };
  };
  minCount?: number;
}

export interface PodSetAssignment {
  name: string;
  flavors?: Record<string, string>;
  resourceUsage?: Record<string, string>;
  count?: number;
}

export interface Admission {
  clusterQueue: string;
  podSetAssignments?: PodSetAssignment[];
}

export interface ReclaimablePod {
  name: string;
  count: number;
}

export interface WorkloadSpec {
  queueName?: string;
  podSets: PodSet[];
  priority?: number;
  priorityClassName?: string;
  priorityClassSource?: string;
  active?: boolean;
}

export interface WorkloadStatus {
  conditions?: K8sCondition[];
  admission?: Admission;
  requeueState?: {
    count?: number;
    requeueAt?: string;
  };
  reclaimablePods?: ReclaimablePod[];
  admissionChecks?: {
    name: string;
    state: 'Pending' | 'Ready' | 'Retry';
    lastTransitionTime?: string;
    podSetUpdates?: {
      name: string;
      labels?: Record<string, string>;
      annotations?: Record<string, string>;
      nodeSelector?: Record<string, string>;
      tolerations?: {
        key?: string;
        operator?: string;
        value?: string;
        effect?: string;
      }[];
    }[];
    message?: string;
  }[];
}

export interface Workload extends KueueResource {
  spec?: WorkloadSpec;
  status?: WorkloadStatus;
}

export type WorkloadPhase =
  | 'Pending'
  | 'QuotaReserved'
  | 'Admitted'
  | 'Running'
  | 'Evicted'
  | 'Finished'
  | 'Unknown';
