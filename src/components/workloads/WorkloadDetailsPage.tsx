import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DocumentTitle,
  HorizontalNav,
  NavPage,
  ResourceLink,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  PageSection,
  Title,
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { WorkloadModel, LocalQueueModel, ClusterQueueModel } from '../../types';
import { useWorkload } from '../../hooks/useKueueResources';
import { getWorkloadPhase, getWorkloadTotalResources } from '../../utils/kueue-helpers';
import { StatusBadge } from '../shared/StatusBadge';
import { ConditionsTable } from '../shared/ConditionsTable';
import { WorkloadDiagnosticPanel } from './WorkloadDiagnosticPanel';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const OverviewTab: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const { workload, loaded } = useWorkload(name, namespace);

  if (!loaded || !workload) return null;

  const phase = getWorkloadPhase(workload);
  const resources = getWorkloadTotalResources(workload);

  return (
    <PageSection>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        <FlexItem>
          <Card>
            <CardTitle>{t('Details')}</CardTitle>
            <CardBody>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {workload.metadata?.name}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ResourceLink kind="Namespace" name={workload.metadata?.namespace} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Phase</DescriptionListTerm>
                  <DescriptionListDescription>
                    <StatusBadge status={phase} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Queue</DescriptionListTerm>
                  <DescriptionListDescription>
                    {workload.spec?.queueName ? (
                      <ResourceLink
                        groupVersionKind={LocalQueueModel}
                        name={workload.spec.queueName}
                        namespace={workload.metadata?.namespace}
                      />
                    ) : (
                      '-'
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {workload.status?.admission && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Cluster Queue')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <ResourceLink
                        groupVersionKind={ClusterQueueModel}
                        name={workload.status.admission.clusterQueue}
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                <DescriptionListGroup>
                  <DescriptionListTerm>Priority</DescriptionListTerm>
                  <DescriptionListDescription>
                    {workload.spec?.priority ?? '-'}
                    {workload.spec?.priorityClassName && ` (${workload.spec.priorityClassName})`}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Timestamp timestamp={workload.metadata?.creationTimestamp} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </FlexItem>

        {Object.keys(resources).length > 0 && (
          <FlexItem>
            <Card>
              <CardTitle>{t('Requested resources')}</CardTitle>
              <CardBody>
                <DescriptionList isHorizontal>
                  {Object.entries(resources).map(([name, value]) => (
                    <DescriptionListGroup key={name}>
                      <DescriptionListTerm>{name}</DescriptionListTerm>
                      <DescriptionListDescription>{value}</DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </DescriptionList>
              </CardBody>
            </Card>
          </FlexItem>
        )}

        {(phase === 'Pending' || phase === 'Evicted' || phase === 'QuotaReserved') && (
          <FlexItem>
            <WorkloadDiagnosticPanel workload={workload} />
          </FlexItem>
        )}
      </Flex>
    </PageSection>
  );
};

const ConditionsTab: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { workload } = useWorkload(name, namespace);

  return (
    <PageSection>
      <ConditionsTable conditions={workload?.status?.conditions} />
    </PageSection>
  );
};

function WorkloadDetailsContent() {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const params = useParams<{ name: string; ns: string }>();
  const name = params.name ?? '';
  const namespace = params.ns ?? '';

  const pages: NavPage[] = [
    {
      href: '',
      name: t('Overview'),
      component: () => <OverviewTab name={name} namespace={namespace} />,
    },
    {
      href: 'conditions',
      name: t('Conditions'),
      component: () => <ConditionsTab name={name} namespace={namespace} />,
    },
  ];

  return (
    <>
      <DocumentTitle>{`${t('Workload details')} · ${name}`}</DocumentTitle>
      <PageSection variant="default">
        <Title headingLevel="h1">
          <ResourceLink
            groupVersionKind={WorkloadModel}
            name={name}
            namespace={namespace}
            linkTo={false}
          />
        </Title>
      </PageSection>
      <HorizontalNav pages={pages} />
    </>
  );
}

export default function WorkloadDetailsPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading Workload details">
      <WorkloadDetailsContent />
    </ErrorBoundary>
  );
}
