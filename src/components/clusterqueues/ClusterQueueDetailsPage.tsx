import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DocumentTitle,
  HorizontalNav,
  NavPage,
  ResourceLink,
  Timestamp,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  PageSection,
  Title,
  Flex,
  FlexItem,
  Button,
  Card,
  CardBody,
  CardTitle,
} from '@patternfly/react-core';
import { PauseCircleIcon, PlayIcon } from '@patternfly/react-icons';
import { ClusterQueueModel } from '../../types';
import { useClusterQueue } from '../../hooks/useKueueResources';
import { getClusterQueueHealthStatus } from '../../utils/kueue-helpers';
import { StatusBadge } from '../shared/StatusBadge';
import { ConditionsTable } from '../shared/ConditionsTable';
import { QuotaBar } from '../shared/QuotaBar';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const OverviewTab: React.FC<{ name: string }> = ({ name }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const { clusterQueue, loaded } = useClusterQueue(name);

  const [canUpdate] = useAccessReview({
    group: ClusterQueueModel.group,
    resource: 'clusterqueues',
    verb: 'update',
    name,
  });

  if (!loaded || !clusterQueue) {
    return null;
  }

  const healthStatus = getClusterQueueHealthStatus(clusterQueue);
  const isPaused =
    clusterQueue.spec?.stopPolicy && clusterQueue.spec.stopPolicy !== 'None';

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
                    {clusterQueue.metadata?.name}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <StatusBadge status={healthStatus} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Cohort')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {clusterQueue.spec?.cohort ?? '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Queuing Strategy</DescriptionListTerm>
                  <DescriptionListDescription>
                    {clusterQueue.spec?.queueingStrategy ?? 'BestEffortFIFO'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Pending workloads')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {clusterQueue.status?.pendingWorkloads ?? 0}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Admitted workloads')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {clusterQueue.status?.admittedWorkloads ?? 0}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Timestamp timestamp={clusterQueue.metadata?.creationTimestamp} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
              {canUpdate && (
                <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '1rem' }}>
                  <FlexItem>
                    <Button
                      variant="secondary"
                      icon={isPaused ? <PlayIcon /> : <PauseCircleIcon />}
                    >
                      {isPaused ? t('Resume') : t('Pause')}
                    </Button>
                  </FlexItem>
                </Flex>
              )}
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Card>
            <CardTitle>{t('Quota')}</CardTitle>
            <CardBody>
              {clusterQueue.spec?.resourceGroups?.map((rg, rgIdx) =>
                rg.flavors.map((flavor) =>
                  flavor.resources.map((resource) => {
                    const usage = clusterQueue.status?.flavorsUsage
                      ?.find((fu) => fu.name === flavor.name)
                      ?.resources.find((r) => r.name === resource.name);
                    const usedValue = parseFloat(usage?.total ?? '0');
                    const totalValue = parseFloat(resource.nominalQuota ?? '0');

                    return (
                      <QuotaBar
                        key={`${rgIdx}-${flavor.name}-${resource.name}`}
                        label={`${resource.name} (${flavor.name})`}
                        used={usedValue}
                        total={totalValue}
                      />
                    );
                  }),
                ),
              )}
              {(!clusterQueue.spec?.resourceGroups ||
                clusterQueue.spec.resourceGroups.length === 0) && (
                <div>No resource groups configured.</div>
              )}
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

const ConditionsTab: React.FC<{ name: string }> = ({ name }) => {
  const { clusterQueue } = useClusterQueue(name);

  return (
    <PageSection>
      <ConditionsTable conditions={clusterQueue?.status?.conditions} />
    </PageSection>
  );
};

function ClusterQueueDetailsContent() {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const params = useParams<{ name: string }>();
  const name = params.name ?? '';

  const pages: NavPage[] = [
    {
      href: '',
      name: t('Overview'),
      component: () => <OverviewTab name={name} />,
    },
    {
      href: 'conditions',
      name: t('Conditions'),
      component: () => <ConditionsTab name={name} />,
    },
  ];

  return (
    <>
      <DocumentTitle>{`${t('ClusterQueue details')} · ${name}`}</DocumentTitle>
      <PageSection variant="default">
        <Title headingLevel="h1">
          <ResourceLink
            groupVersionKind={ClusterQueueModel}
            name={name}
            linkTo={false}
          />
        </Title>
      </PageSection>
      <HorizontalNav pages={pages} />
    </>
  );
}

export default function ClusterQueueDetailsPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading ClusterQueue details">
      <ClusterQueueDetailsContent />
    </ErrorBoundary>
  );
}
