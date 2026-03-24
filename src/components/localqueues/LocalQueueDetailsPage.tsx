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
import { LocalQueueModel, ClusterQueueModel } from '../../types';
import { useLocalQueue } from '../../hooks/useKueueResources';
import { ConditionsTable } from '../shared/ConditionsTable';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const OverviewTab: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const { localQueue, loaded } = useLocalQueue(name, namespace);

  if (!loaded || !localQueue) return null;

  const activeCondition = localQueue.status?.conditions?.find((c) => c.type === 'Active');

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
                    {localQueue.metadata?.name}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ResourceLink kind="Namespace" name={localQueue.metadata?.namespace} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Cluster Queue')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ResourceLink
                      groupVersionKind={ClusterQueueModel}
                      name={localQueue.spec?.clusterQueue}
                    />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {activeCondition?.status === 'True' ? 'Active' : 'Inactive'}
                    {activeCondition?.message && ` — ${activeCondition.message}`}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Pending workloads')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {localQueue.status?.pendingWorkloads ?? 0}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Admitted workloads')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {localQueue.status?.admittedWorkloads ?? 0}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Timestamp timestamp={localQueue.metadata?.creationTimestamp} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

const ConditionsTab: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { localQueue } = useLocalQueue(name, namespace);

  return (
    <PageSection>
      <ConditionsTable conditions={localQueue?.status?.conditions} />
    </PageSection>
  );
};

function LocalQueueDetailsContent() {
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
      <DocumentTitle>{`${t('LocalQueue details')} · ${name}`}</DocumentTitle>
      <PageSection variant="default">
        <Title headingLevel="h1">
          <ResourceLink
            groupVersionKind={LocalQueueModel}
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

export default function LocalQueueDetailsPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading LocalQueue details">
      <LocalQueueDetailsContent />
    </ErrorBoundary>
  );
}
