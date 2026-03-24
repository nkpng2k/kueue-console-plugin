import { useTranslation } from 'react-i18next';
import {
  ListPageHeader,
  ListPageBody,
  ListPageFilter,
  VirtualizedTable,
  TableData,
  RowProps,
  useListPageFilter,
  ListPageCreateButton,
  ResourceLink,
  Timestamp,
  TableColumn,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { ClusterQueue, ClusterQueueModel } from '../../types';
import { useClusterQueues } from '../../hooks/useKueueResources';
import { getClusterQueueHealthStatus } from '../../utils/kueue-helpers';
import { StatusBadge } from '../shared/StatusBadge';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const columns: TableColumn<ClusterQueue>[] = [
  {
    title: 'Name',
    id: 'name',
    transforms: [sortable],
    sort: 'metadata.name',
  },
  {
    title: 'Status',
    id: 'status',
  },
  {
    title: 'Cohort',
    id: 'cohort',
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
    title: 'Flavors',
    id: 'flavors',
  },
  {
    title: 'Created',
    id: 'created',
    transforms: [sortable],
    sort: 'metadata.creationTimestamp',
  },
];

const ClusterQueueRow: React.FC<RowProps<ClusterQueue>> = ({ obj, activeColumnIDs }) => {
  const healthStatus = getClusterQueueHealthStatus(obj);
  const flavorCount =
    obj.spec?.resourceGroups?.reduce((acc, rg) => acc + (rg.flavors?.length ?? 0), 0) ?? 0;

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={ClusterQueueModel}
          name={obj.metadata?.name}
        />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        <StatusBadge status={healthStatus} />
      </TableData>
      <TableData id="cohort" activeColumnIDs={activeColumnIDs}>
        {obj.spec?.cohort ?? '-'}
      </TableData>
      <TableData id="pending" activeColumnIDs={activeColumnIDs}>
        {obj.status?.pendingWorkloads ?? 0}
      </TableData>
      <TableData id="admitted" activeColumnIDs={activeColumnIDs}>
        {obj.status?.admittedWorkloads ?? 0}
      </TableData>
      <TableData id="flavors" activeColumnIDs={activeColumnIDs}>
        {flavorCount}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj.metadata?.creationTimestamp} />
      </TableData>
    </>
  );
};

const ClusterQueueListPageContent: React.FC = () => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const { clusterQueues, loaded, error } = useClusterQueues();
  const [data, filteredData, onFilterChange] = useListPageFilter(clusterQueues);

  return (
    <>
      <ListPageHeader title={t('Cluster Queues')}>
        <ListPageCreateButton
          createAccessReview={{
            groupVersionKind: ClusterQueueModel,
          }}
        >
          {t('Create ClusterQueue')}
        </ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<ClusterQueue>
          data={filteredData}
          unfilteredData={clusterQueues}
          loaded={loaded}
          loadError={error}
          columns={columns}
          Row={ClusterQueueRow}
        />
      </ListPageBody>
    </>
  );
};

export default function ClusterQueueListPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading Cluster Queues">
      <ClusterQueueListPageContent />
    </ErrorBoundary>
  );
}
