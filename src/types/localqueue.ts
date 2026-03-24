import { K8sCondition, KueueResource } from './common';

export interface FlavorUsageSummary {
  name: string;
  resources: {
    name: string;
    total?: string;
    borrowed?: string;
  }[];
}

export interface LocalQueueSpec {
  clusterQueue: string;
  stopPolicy?: 'None' | 'Hold' | 'HoldAndDrain';
}

export interface LocalQueueStatus {
  conditions?: K8sCondition[];
  admittedWorkloads?: number;
  pendingWorkloads?: number;
  reservingWorkloads?: number;
  flavorsReservation?: FlavorUsageSummary[];
  flavorUsage?: FlavorUsageSummary[];
}

export interface LocalQueue extends KueueResource {
  spec?: LocalQueueSpec;
  status?: LocalQueueStatus;
}
