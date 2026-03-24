import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface K8sCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
  observedGeneration?: number;
}

export const KueueGroup = 'kueue.x-k8s.io';
export const KueueVersion = 'v1beta1';

export const ClusterQueueModel = {
  group: KueueGroup,
  version: KueueVersion,
  kind: 'ClusterQueue',
};

export const LocalQueueModel = {
  group: KueueGroup,
  version: KueueVersion,
  kind: 'LocalQueue',
};

export const WorkloadModel = {
  group: KueueGroup,
  version: KueueVersion,
  kind: 'Workload',
};

export const ResourceFlavorModel = {
  group: KueueGroup,
  version: KueueVersion,
  kind: 'ResourceFlavor',
};

export interface KueueResource extends K8sResourceCommon {
  apiVersion?: string;
  kind?: string;
}
