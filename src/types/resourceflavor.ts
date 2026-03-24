import { KueueResource } from './common';

export interface ResourceFlavorSpec {
  nodeLabels?: Record<string, string>;
  nodeTaints?: {
    key: string;
    value?: string;
    effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
  }[];
  tolerations?: {
    key?: string;
    operator?: string;
    value?: string;
    effect?: string;
    tolerationSeconds?: number;
  }[];
}

export interface ResourceFlavor extends KueueResource {
  spec?: ResourceFlavorSpec;
}
