import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Alert,
  AlertVariant,
  List,
  ListItem,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Workload, ClusterQueueModel, LocalQueueModel } from '../../types';
import { useWorkloadDiagnostic } from '../../hooks/useWorkloadDiagnostic';

interface WorkloadDiagnosticPanelProps {
  workload: Workload;
}

export const WorkloadDiagnosticPanel: React.FC<WorkloadDiagnosticPanelProps> = ({ workload }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const diagnostic = useWorkloadDiagnostic(workload);

  if (!diagnostic) return null;

  return (
    <Card>
      <CardTitle>
        <InfoCircleIcon /> {t('Why am I waiting?')}
      </CardTitle>
      <CardBody>
        <Alert
          variant={AlertVariant.info}
          isInline
          isPlain
          title={diagnostic.reason}
        />

        <DescriptionList isHorizontal style={{ marginTop: '1rem' }}>
          {diagnostic.localQueue && (
            <DescriptionListGroup>
              <DescriptionListTerm>Local Queue</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={LocalQueueModel}
                  name={diagnostic.localQueue.metadata?.name}
                  namespace={diagnostic.localQueue.metadata?.namespace}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {diagnostic.clusterQueue && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Cluster Queue')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={ClusterQueueModel}
                  name={diagnostic.clusterQueue.metadata?.name}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {diagnostic.queuePosition !== null && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Queue position')}</DescriptionListTerm>
              <DescriptionListDescription>
                {diagnostic.queuePosition} pending workload(s) in queue
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {Object.keys(diagnostic.requestedResources).length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Requested resources')}</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.entries(diagnostic.requestedResources).map(([name, value]) => (
                  <div key={name}>
                    {name}: {value}
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {Object.keys(diagnostic.availableResources).length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Available resources')}</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.entries(diagnostic.availableResources).map(([name, value]) => (
                  <div key={name}>
                    {name}: {value}
                  </div>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>

        {diagnostic.suggestions.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong>{t('Suggestions')}</strong>
            <List>
              {diagnostic.suggestions.map((suggestion, idx) => (
                <ListItem key={idx}>{suggestion}</ListItem>
              ))}
            </List>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
