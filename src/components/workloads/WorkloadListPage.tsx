import { useTranslation } from 'react-i18next';
import {
  ListPageHeader,
  ListPageBody,
  ListPageFilter,
  VirtualizedTable,
  TableData,
  RowProps,
  useListPageFilter,
  useActiveNamespace,
  ResourceLink,
  Timestamp,
  TableColumn,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { Workload, WorkloadModel, LocalQueueModel } from '../../types';
import { useWorkloads } from '../../hooks/useKueueResources';
import { getWorkloadPhase } from '../../utils/kueue-helpers';
import { StatusBadge } from '../shared/StatusBadge';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const columns: TableColumn<Workload>[] = [
  {
    title: 'Name',
    id: 'name',
    transforms: [sortable],
    sort: 'metadata.name',
  },
  {
    title: 'Namespace',
    id: 'namespace',
    transforms: [sortable],
    sort: 'metadata.namespace',
  },
  {
    title: 'Phase',
    id: 'phase',
  },
  {
    title: 'Queue',
    id: 'queue',
  },
  {
    title: 'Priority',
    id: 'priority',
    transforms: [sortable],
    sort: 'spec.priority',
  },
  {
    title: 'Created',
    id: 'created',
    transforms: [sortable],
    sort: 'metadata.creationTimestamp',
  },
];

const WorkloadRow: React.FC<RowProps<Workload>> = ({ obj, activeColumnIDs }) => {
  const phase = getWorkloadPhase(obj);

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={WorkloadModel}
          name={obj.metadata?.name}
          namespace={obj.metadata?.namespace}
        />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata?.namespace} />
      </TableData>
      <TableData id="phase" activeColumnIDs={activeColumnIDs}>
        <StatusBadge status={phase} />
      </TableData>
      <TableData id="queue" activeColumnIDs={activeColumnIDs}>
        {obj.spec?.queueName ? (
          <ResourceLink
            groupVersionKind={LocalQueueModel}
            name={obj.spec.queueName}
            namespace={obj.metadata?.namespace}
          />
        ) : (
          '-'
        )}
      </TableData>
      <TableData id="priority" activeColumnIDs={activeColumnIDs}>
        {obj.spec?.priority ?? '-'}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj.metadata?.creationTimestamp} />
      </TableData>
    </>
  );
};

const WorkloadListPageContent: React.FC = () => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === '#ALL_NS#' ? undefined : activeNamespace;
  const { workloads, loaded, error } = useWorkloads(namespace);
  const [data, filteredData, onFilterChange] = useListPageFilter(workloads);

  return (
    <>
      <ListPageHeader title={t('Workloads')} />
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<Workload>
          data={filteredData}
          unfilteredData={workloads}
          loaded={loaded}
          loadError={error}
          columns={columns}
          Row={WorkloadRow}
        />
      </ListPageBody>
    </>
  );
};

export default function WorkloadListPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading Workloads">
      <WorkloadListPageContent />
    </ErrorBoundary>
  );
}
