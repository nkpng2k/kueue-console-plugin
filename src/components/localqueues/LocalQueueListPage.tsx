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
import { LocalQueue, LocalQueueModel, ClusterQueueModel } from '../../types';
import { useLocalQueues } from '../../hooks/useKueueResources';
import { StatusBadge } from '../shared/StatusBadge';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const columns: TableColumn<LocalQueue>[] = [
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
    title: 'Cluster Queue',
    id: 'clusterQueue',
  },
  {
    title: 'Status',
    id: 'status',
  },
  {
    title: 'Pending',
    id: 'pending',
    transforms: [sortable],
    sort: 'status.pendingWorkloads',
  },
  {
    title: 'Admitted',
    id: 'admitted',
    transforms: [sortable],
    sort: 'status.admittedWorkloads',
  },
  {
    title: 'Created',
    id: 'created',
    transforms: [sortable],
    sort: 'metadata.creationTimestamp',
  },
];

const LocalQueueRow: React.FC<RowProps<LocalQueue>> = ({ obj, activeColumnIDs }) => {
  const activeCondition = obj.status?.conditions?.find((c) => c.type === 'Active');
  const status = activeCondition?.status === 'True' ? 'active' : activeCondition?.status === 'False' ? 'inactive' : 'unknown';

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={LocalQueueModel}
          name={obj.metadata?.name}
          namespace={obj.metadata?.namespace}
        />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata?.namespace} />
      </TableData>
      <TableData id="clusterQueue" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={ClusterQueueModel}
          name={obj.spec?.clusterQueue}
        />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        <StatusBadge status={status} />
      </TableData>
      <TableData id="pending" activeColumnIDs={activeColumnIDs}>
        {obj.status?.pendingWorkloads ?? 0}
      </TableData>
      <TableData id="admitted" activeColumnIDs={activeColumnIDs}>
        {obj.status?.admittedWorkloads ?? 0}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj.metadata?.creationTimestamp} />
      </TableData>
    </>
  );
};

const LocalQueueListPageContent: React.FC = () => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === '#ALL_NS#' ? undefined : activeNamespace;
  const { localQueues, loaded, error } = useLocalQueues(namespace);
  const [data, filteredData, onFilterChange] = useListPageFilter(localQueues);

  return (
    <>
      <ListPageHeader title={t('Local Queues')} />
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<LocalQueue>
          data={filteredData}
          unfilteredData={localQueues}
          loaded={loaded}
          loadError={error}
          columns={columns}
          Row={LocalQueueRow}
        />
      </ListPageBody>
    </>
  );
};

export default function LocalQueueListPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading Local Queues">
      <LocalQueueListPageContent />
    </ErrorBoundary>
  );
}
