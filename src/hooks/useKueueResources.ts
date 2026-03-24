import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  ClusterQueue,
  LocalQueue,
  Workload,
  ResourceFlavor,
  ClusterQueueModel,
  LocalQueueModel,
  WorkloadModel,
  ResourceFlavorModel,
} from '../types';

export const useClusterQueues = () => {
  const [data, loaded, error] = useK8sWatchResource<ClusterQueue[]>({
    groupVersionKind: ClusterQueueModel,
    isList: true,
  });
  return { clusterQueues: data, loaded, error };
};

export const useClusterQueue = (name: string) => {
  const [data, loaded, error] = useK8sWatchResource<ClusterQueue>({
    groupVersionKind: ClusterQueueModel,
    name,
  });
  return { clusterQueue: data, loaded, error };
};

export const useLocalQueues = (namespace?: string) => {
  const [data, loaded, error] = useK8sWatchResource<LocalQueue[]>({
    groupVersionKind: LocalQueueModel,
    namespace,
    isList: true,
  });
  return { localQueues: data, loaded, error };
};

export const useLocalQueue = (name: string, namespace: string) => {
  const [data, loaded, error] = useK8sWatchResource<LocalQueue>({
    groupVersionKind: LocalQueueModel,
    name,
    namespace,
  });
  return { localQueue: data, loaded, error };
};

export const useWorkloads = (namespace?: string) => {
  const [data, loaded, error] = useK8sWatchResource<Workload[]>({
    groupVersionKind: WorkloadModel,
    namespace,
    isList: true,
  });
  return { workloads: data, loaded, error };
};

export const useWorkload = (name: string, namespace: string) => {
  const [data, loaded, error] = useK8sWatchResource<Workload>({
    groupVersionKind: WorkloadModel,
    name,
    namespace,
  });
  return { workload: data, loaded, error };
};

export const useResourceFlavors = () => {
  const [data, loaded, error] = useK8sWatchResource<ResourceFlavor[]>({
    groupVersionKind: ResourceFlavorModel,
    isList: true,
  });
  return { resourceFlavors: data, loaded, error };
};

export const useResourceFlavor = (name: string) => {
  const [data, loaded, error] = useK8sWatchResource<ResourceFlavor>({
    groupVersionKind: ResourceFlavorModel,
    name,
  });
  return { resourceFlavor: data, loaded, error };
};
