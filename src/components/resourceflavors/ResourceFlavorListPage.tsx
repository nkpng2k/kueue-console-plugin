import { useTranslation } from 'react-i18next';
import {
  ListPageHeader,
  ListPageBody,
  ListPageFilter,
  VirtualizedTable,
  TableData,
  RowProps,
  useListPageFilter,
  ResourceLink,
  Timestamp,
  TableColumn,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { Label, LabelGroup } from '@patternfly/react-core';
import { ResourceFlavor, ResourceFlavorModel } from '../../types';
import { useResourceFlavors } from '../../hooks/useKueueResources';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const columns: TableColumn<ResourceFlavor>[] = [
  {
    title: 'Name',
    id: 'name',
    transforms: [sortable],
    sort: 'metadata.name',
  },
  {
    title: 'Node Labels',
    id: 'nodeLabels',
  },
  {
    title: 'Taints',
    id: 'taints',
  },
  {
    title: 'Created',
    id: 'created',
    transforms: [sortable],
    sort: 'metadata.creationTimestamp',
  },
];

const ResourceFlavorRow: React.FC<RowProps<ResourceFlavor>> = ({ obj, activeColumnIDs }) => {
  const labels = obj.spec?.nodeLabels ?? {};
  const taints = obj.spec?.nodeTaints ?? [];

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={ResourceFlavorModel}
          name={obj.metadata?.name}
        />
      </TableData>
      <TableData id="nodeLabels" activeColumnIDs={activeColumnIDs}>
        {Object.keys(labels).length > 0 ? (
          <LabelGroup>
            {Object.entries(labels).map(([key, value]) => (
              <Label key={key} isCompact>
                {key}={value}
              </Label>
            ))}
          </LabelGroup>
        ) : (
          '-'
        )}
      </TableData>
      <TableData id="taints" activeColumnIDs={activeColumnIDs}>
        {taints.length > 0 ? (
          <LabelGroup>
            {taints.map((taint, idx) => (
              <Label key={idx} isCompact color="orange">
                {taint.key}:{taint.effect}
              </Label>
            ))}
          </LabelGroup>
        ) : (
          '-'
        )}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj.metadata?.creationTimestamp} />
      </TableData>
    </>
  );
};

const ResourceFlavorListPageContent: React.FC = () => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const { resourceFlavors, loaded, error } = useResourceFlavors();
  const [data, filteredData, onFilterChange] = useListPageFilter(resourceFlavors);

  return (
    <>
      <ListPageHeader title={t('Resource Flavors')} />
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<ResourceFlavor>
          data={filteredData}
          unfilteredData={resourceFlavors}
          loaded={loaded}
          loadError={error}
          columns={columns}
          Row={ResourceFlavorRow}
        />
      </ListPageBody>
    </>
  );
};

export default function ResourceFlavorListPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading Resource Flavors">
      <ResourceFlavorListPageContent />
    </ErrorBoundary>
  );
}
