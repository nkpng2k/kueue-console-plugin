import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { DocumentTitle, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  PageSection,
  Title,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  FlexItem,
  Content,
  Label,
  LabelGroup,
  Progress,
  ProgressVariant,
  ProgressSize,
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  Divider,
  Skeleton,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Icon,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CubesIcon,
  InProgressIcon,
  OutlinedClockIcon,
  TachometerAltIcon,
} from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { ClusterQueue, Workload, ClusterQueueModel, WorkloadModel, LocalQueueModel } from '../../types';
import { useClusterQueues, useWorkloads } from '../../hooks/useKueueResources';
import { getClusterQueueHealthStatus, getWorkloadPhase, getTimeSince } from '../../utils/kueue-helpers';
import { StatusBadge } from '../shared/StatusBadge';
import { ErrorBoundary } from '../shared/ErrorBoundary';

// --- Section 2: Conditional Alert Banner ---

const AlertBanner: React.FC<{
  clusterQueues: ClusterQueue[];
  pendingWorkloads: Workload[];
}> = ({ clusterQueues, pendingWorkloads }) => {
  const stoppedQueues = clusterQueues.filter(
    (cq) => cq.spec?.stopPolicy && cq.spec.stopPolicy !== 'None',
  );
  const longPending = pendingWorkloads.filter((w) => {
    const created = w.metadata?.creationTimestamp;
    if (!created) return false;
    return Date.now() - new Date(created).getTime() > 30 * 60 * 1000;
  });

  if (stoppedQueues.length === 0 && longPending.length === 0) return null;

  return (
    <PageSection padding={{ default: 'noPadding' }} style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '0.5rem' }}>
      {stoppedQueues.length > 0 && (
        <Alert
          variant={AlertVariant.danger}
          title={`${stoppedQueues.length} ClusterQueue(s) paused or stopped`}
          isInline
          style={{ marginBottom: longPending.length > 0 ? '0.5rem' : 0 }}
          actionLinks={
            <AlertActionLink onClick={() => undefined}>View stopped queues</AlertActionLink>
          }
        />
      )}
      {longPending.length > 0 && (
        <Alert
          variant={AlertVariant.warning}
          title={`${longPending.length} workload(s) pending for over 30 minutes`}
          isInline
          actionLinks={
            <AlertActionLink onClick={() => undefined}>View pending workloads</AlertActionLink>
          }
        />
      )}
    </PageSection>
  );
};

// --- Section 3: Summary Statistics ---

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
}> = ({ title, value, subtitle, icon, status }) => (
  <Card isCompact isPlain>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardBody>
      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Content component="p" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
            {value}
          </Content>
        </FlexItem>
        <FlexItem>
          <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            {status && <Icon status={status}>{icon}</Icon>}
            <Content component="small">{subtitle}</Content>
          </Flex>
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);

const SummaryStatistics: React.FC<{
  clusterQueues: ClusterQueue[];
  allWorkloads: Workload[];
  pendingWorkloads: Workload[];
  loaded: boolean;
}> = ({ clusterQueues, allWorkloads, pendingWorkloads, loaded }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');

  if (!loaded) {
    return (
      <Grid hasGutter>
        {[0, 1, 2, 3].map((i) => (
          <GridItem key={i} span={12} lg={3}>
            <Card isCompact isPlain>
              <CardHeader><CardTitle><Skeleton width="60%" /></CardTitle></CardHeader>
              <CardBody><Skeleton height="60px" /></CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  }

  const totalQueues = clusterQueues.length;
  const activeQueues = clusterQueues.filter(
    (cq) => getClusterQueueHealthStatus(cq) === 'healthy',
  ).length;
  const totalAdmitted = clusterQueues.reduce(
    (sum, cq) => sum + (cq.status?.admittedWorkloads ?? 0),
    0,
  );
  const totalPending = pendingWorkloads.length;
  const admittedRate =
    totalAdmitted + totalPending > 0
      ? Math.round((totalAdmitted / (totalAdmitted + totalPending)) * 100)
      : 100;

  const longPendingCount = pendingWorkloads.filter((w) => {
    const created = w.metadata?.creationTimestamp;
    if (!created) return false;
    return Date.now() - new Date(created).getTime() > 30 * 60 * 1000;
  }).length;

  return (
    <Grid hasGutter>
      <GridItem span={12} lg={3}>
        <StatCard
          title={t('Cluster Queues')}
          value={totalQueues}
          subtitle={activeQueues === totalQueues ? 'All active' : `${activeQueues} active`}
          icon={<CheckCircleIcon />}
          status={activeQueues === totalQueues ? 'success' : 'warning'}
        />
      </GridItem>
      <GridItem span={12} lg={3}>
        <StatCard
          title="Admitted Workloads"
          value={totalAdmitted}
          subtitle={`across ${totalQueues} queues`}
          icon={<InProgressIcon />}
          status="info"
        />
      </GridItem>
      <GridItem span={12} lg={3}>
        <Card isCompact isPlain>
          <CardHeader><CardTitle>{t('Pending Workloads')}</CardTitle></CardHeader>
          <CardBody>
            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Content component="p" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {totalPending}
                </Content>
              </FlexItem>
              <FlexItem>
                {longPendingCount > 0 ? (
                  <Label color="orange" icon={<OutlinedClockIcon />}>
                    {longPendingCount} waiting &gt; 30m
                  </Label>
                ) : totalPending === 0 ? (
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <Icon status="success"><CheckCircleIcon /></Icon>
                    <Content component="small">None pending</Content>
                  </Flex>
                ) : (
                  <Content component="small">All recently submitted</Content>
                )}
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={12} lg={3}>
        <StatCard
          title="Admission Rate"
          value={`${admittedRate}%`}
          subtitle={`${totalAdmitted} of ${totalAdmitted + totalPending} admitted`}
          icon={<TachometerAltIcon />}
          status={admittedRate >= 80 ? 'success' : admittedRate >= 50 ? 'warning' : 'danger'}
        />
      </GridItem>
    </Grid>
  );
};

// --- Section 4 Left: ClusterQueue Health ---

const QueueHealthCard: React.FC<{ clusterQueues: ClusterQueue[]; loaded: boolean }> = ({
  clusterQueues,
  loaded,
}) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const history = useHistory();

  if (!loaded) {
    return (
      <Card isFullHeight>
        <CardHeader><CardTitle>{t('Queue Health')}</CardTitle></CardHeader>
        <CardBody><Skeleton height="200px" /></CardBody>
      </Card>
    );
  }

  return (
    <Card isFullHeight>
      <CardHeader
        actions={{
          actions: (
            <Button variant="link" onClick={() => history.push('/k8s/cluster/kueue.x-k8s.io~v1beta1~ClusterQueue')}>
              View all
            </Button>
          ),
          hasNoOffset: true,
        }}
      >
        <CardTitle>ClusterQueue Status</CardTitle>
      </CardHeader>
      <CardBody>
        {clusterQueues.length === 0 ? (
          <Content component="p">No ClusterQueues found.</Content>
        ) : (
          <DescriptionList isHorizontal isCompact>
            {clusterQueues.map((cq) => {
              const health = getClusterQueueHealthStatus(cq);
              const admitted = cq.status?.admittedWorkloads ?? 0;
              const pending = cq.status?.pendingWorkloads ?? 0;

              return (
                <DescriptionListGroup key={cq.metadata?.name}>
                  <DescriptionListTerm>
                    <ResourceLink
                      groupVersionKind={ClusterQueueModel}
                      name={cq.metadata?.name}
                    />
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <StatusBadge status={health} />
                      {cq.spec?.cohort && (
                        <LabelGroup categoryName="Cohort">
                          <Label color="blue" isCompact>
                            {cq.spec.cohort}
                          </Label>
                        </LabelGroup>
                      )}
                      <Content component="small">
                        {admitted} admitted / {pending} pending
                      </Content>
                    </Flex>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              );
            })}
          </DescriptionList>
        )}
      </CardBody>
    </Card>
  );
};

// --- Section 4 Right: Resource Utilization ---

const ResourceUtilizationCard: React.FC<{ clusterQueues: ClusterQueue[]; loaded: boolean }> = ({
  clusterQueues,
  loaded,
}) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');

  if (!loaded) {
    return (
      <Card isFullHeight>
        <CardHeader><CardTitle>{t('Resource Utilization')}</CardTitle></CardHeader>
        <CardBody><Skeleton height="200px" /></CardBody>
      </Card>
    );
  }

  return (
    <Card isFullHeight>
      <CardHeader>
        <CardTitle>Resource Utilization by ClusterQueue</CardTitle>
      </CardHeader>
      <CardBody>
        {clusterQueues.length === 0 ? (
          <Content component="p">No ClusterQueues found.</Content>
        ) : (
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
            {clusterQueues.map((cq, idx) => {
              const resourceGroups = cq.spec?.resourceGroups ?? [];

              return (
                <FlexItem key={cq.metadata?.name}>
                  {idx > 0 && <Divider style={{ marginBottom: '1rem' }} />}
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: '0.5rem' }}>
                    <Content component="p" style={{ fontWeight: 700 }}>
                      {cq.metadata?.name}
                    </Content>
                    {cq.spec?.cohort && (
                      <Content component="small">Cohort: {cq.spec.cohort}</Content>
                    )}
                  </Flex>
                  {resourceGroups.map((rg) =>
                    rg.flavors.map((flavor) =>
                      flavor.resources.map((resource) => {
                        const usage = cq.status?.flavorsUsage
                          ?.find((fu) => fu.name === flavor.name)
                          ?.resources.find((r) => r.name === resource.name);
                        const usedVal = parseFloat(usage?.total ?? '0');
                        const totalVal = parseFloat(resource.nominalQuota ?? '0');
                        const pct = totalVal > 0 ? Math.round((usedVal / totalVal) * 100) : 0;

                        const variant =
                          pct >= 95
                            ? ProgressVariant.danger
                            : pct >= 80
                              ? ProgressVariant.warning
                              : undefined;

                        return (
                          <div key={`${flavor.name}-${resource.name}`} style={{ marginBottom: '0.5rem' }}>
                            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                              <Content component="small">
                                {resource.name} ({flavor.name})
                              </Content>
                              <Content component="small">
                                {usage?.total ?? '0'} / {resource.nominalQuota}
                              </Content>
                            </Flex>
                            <Progress
                              value={pct}
                              measureLocation="none"
                              size={ProgressSize.sm}
                              variant={variant}
                              aria-label={`${resource.name} usage`}
                            />
                          </div>
                        );
                      }),
                    ),
                  )}
                  {resourceGroups.length === 0 && (
                    <Content component="small">No resource groups configured</Content>
                  )}
                </FlexItem>
              );
            })}
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

// --- Section 5 Right: Pending Workloads Table ---

const PendingWorkloadsTable: React.FC<{
  pendingWorkloads: Workload[];
  loaded: boolean;
}> = ({ pendingWorkloads, loaded }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const history = useHistory();

  if (!loaded) {
    return (
      <Card isFullHeight>
        <CardHeader><CardTitle>{t('Pending Workloads')}</CardTitle></CardHeader>
        <CardBody><Skeleton height="200px" /></CardBody>
      </Card>
    );
  }

  const sorted = [...pendingWorkloads].sort((a, b) => {
    const aTime = new Date(a.metadata?.creationTimestamp ?? '').getTime();
    const bTime = new Date(b.metadata?.creationTimestamp ?? '').getTime();
    return aTime - bTime; // oldest first
  });

  return (
    <Card isFullHeight>
      <CardHeader
        actions={{
          actions: (
            <Button
              variant="link"
              onClick={() => history.push('/k8s/all-namespaces/kueue.x-k8s.io~v1beta1~Workload')}
            >
              View all
            </Button>
          ),
          hasNoOffset: true,
        }}
      >
        <CardTitle>{t('Pending Workloads')}</CardTitle>
      </CardHeader>
      <CardBody>
        {sorted.length === 0 ? (
          <EmptyState headingLevel="h4" titleText="No pending workloads" icon={CheckCircleIcon}>
            <EmptyStateBody>All submitted workloads have been admitted.</EmptyStateBody>
          </EmptyState>
        ) : (
          <Table aria-label="Pending workloads" variant="compact">
            <Thead>
              <Tr>
                <Th>{t('Name')}</Th>
                <Th>Queue</Th>
                <Th>Priority</Th>
                <Th>Waiting</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sorted.slice(0, 8).map((w) => {
                const waitTime = w.metadata?.creationTimestamp
                  ? getTimeSince(w.metadata.creationTimestamp)
                  : '-';
                const isLongWait = w.metadata?.creationTimestamp
                  ? Date.now() - new Date(w.metadata.creationTimestamp).getTime() > 30 * 60 * 1000
                  : false;

                return (
                  <Tr key={`${w.metadata?.namespace}/${w.metadata?.name}`}>
                    <Td dataLabel="Name">
                      <ResourceLink
                        groupVersionKind={WorkloadModel}
                        name={w.metadata?.name}
                        namespace={w.metadata?.namespace}
                      />
                    </Td>
                    <Td dataLabel="Queue">
                      {w.spec?.queueName ? (
                        <ResourceLink
                          groupVersionKind={LocalQueueModel}
                          name={w.spec.queueName}
                          namespace={w.metadata?.namespace}
                        />
                      ) : '-'}
                    </Td>
                    <Td dataLabel="Priority">
                      {w.spec?.priority !== undefined ? (
                        <Label color="blue" isCompact>
                          {w.spec.priorityClassName ?? w.spec.priority}
                        </Label>
                      ) : (
                        <Label color="grey" isCompact>default</Label>
                      )}
                    </Td>
                    <Td dataLabel="Waiting">
                      <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <Content component="small">{waitTime}</Content>
                        {isLongWait && (
                          <Icon status="danger"><ExclamationCircleIcon /></Icon>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
        {sorted.length > 8 && (
          <Content component="small" style={{ marginTop: '0.5rem' }}>
            ...and {sorted.length - 8} more
          </Content>
        )}
      </CardBody>
    </Card>
  );
};

// --- Section 5 Left: Recent Activity ---

const RecentActivityCard: React.FC<{
  clusterQueues: ClusterQueue[];
  allWorkloads: Workload[];
  loaded: boolean;
}> = ({ clusterQueues, allWorkloads, loaded }) => {
  if (!loaded) {
    return (
      <Card isFullHeight>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardBody><Skeleton height="200px" /></CardBody>
      </Card>
    );
  }

  // Build activity items from workload conditions
  const activities: {
    icon: React.ReactNode;
    status: 'success' | 'warning' | 'danger' | 'info';
    action: string;
    workloadName: string;
    workloadNamespace: string;
    queue: string;
    timestamp: string;
  }[] = [];

  for (const w of allWorkloads) {
    const conditions = w.status?.conditions ?? [];
    for (const c of conditions) {
      if (c.type === 'Admitted' && c.status === 'True') {
        activities.push({
          icon: <CheckCircleIcon />,
          status: 'success',
          action: 'Workload admitted',
          workloadName: w.metadata?.name ?? '',
          workloadNamespace: w.metadata?.namespace ?? '',
          queue: w.spec?.queueName ?? '',
          timestamp: c.lastTransitionTime ?? '',
        });
      } else if (c.type === 'Evicted' && c.status === 'True') {
        activities.push({
          icon: <ExclamationTriangleIcon />,
          status: 'warning',
          action: 'Workload evicted',
          workloadName: w.metadata?.name ?? '',
          workloadNamespace: w.metadata?.namespace ?? '',
          queue: w.spec?.queueName ?? '',
          timestamp: c.lastTransitionTime ?? '',
        });
      } else if (c.type === 'Finished' && c.status === 'True') {
        activities.push({
          icon: <CheckCircleIcon />,
          status: 'info',
          action: 'Workload finished',
          workloadName: w.metadata?.name ?? '',
          workloadNamespace: w.metadata?.namespace ?? '',
          queue: w.spec?.queueName ?? '',
          timestamp: c.lastTransitionTime ?? '',
        });
      }
    }
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivities = activities.slice(0, 8);

  return (
    <Card isFullHeight>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardBody>
        {recentActivities.length === 0 ? (
          <Content component="p">No recent activity.</Content>
        ) : (
          <DescriptionList isCompact>
            {recentActivities.map((activity, idx) => (
              <DescriptionListGroup key={idx}>
                <DescriptionListTerm>
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <Icon status={activity.status}>{activity.icon}</Icon>
                    <Content component="small" style={{ fontWeight: 600 }}>
                      {activity.action}
                    </Content>
                  </Flex>
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex direction={{ default: 'column' }}>
                    <ResourceLink
                      groupVersionKind={WorkloadModel}
                      name={activity.workloadName}
                      namespace={activity.workloadNamespace}
                    />
                    <Flex gap={{ default: 'gapSm' }}>
                      {activity.queue && (
                        <Content component="small">to {activity.queue}</Content>
                      )}
                      <Content component="small">
                        {getTimeSince(activity.timestamp)} ago
                      </Content>
                    </Flex>
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
            ))}
          </DescriptionList>
        )}
      </CardBody>
    </Card>
  );
};

// --- Empty State ---

const EmptyClusterState: React.FC = () => {
  const history = useHistory();

  return (
    <PageSection>
      <EmptyState headingLevel="h1" titleText="Get started with Kueue" icon={CubesIcon} variant="full">
        <EmptyStateBody>
          Kueue manages job queueing and resource quotas for your cluster workloads.
          Create a ClusterQueue to define resource pools and start managing workloads.
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="primary"
              onClick={() => history.push('/k8s/cluster/kueue.x-k8s.io~v1beta1~ClusterQueue/~new')}
            >
              Create your first ClusterQueue
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

// --- Main Dashboard ---

function OverviewDashboardContent() {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const { clusterQueues, loaded: cqLoaded } = useClusterQueues();
  const { workloads: allWorkloads, loaded: wlLoaded } = useWorkloads();
  const loaded = cqLoaded && wlLoaded;

  const queues = clusterQueues ?? [];
  const workloads = allWorkloads ?? [];

  const pendingWorkloads = workloads.filter((w) => getWorkloadPhase(w) === 'Pending');

  // Show empty state if no queues exist
  if (loaded && queues.length === 0) {
    return (
      <>
        <DocumentTitle>{t('Workload Management')}</DocumentTitle>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Workload Management')}</Title>
        </PageSection>
        <EmptyClusterState />
      </>
    );
  }

  return (
    <>
      <DocumentTitle>{t('Workload Management')}</DocumentTitle>

      {/* Section 1: Header */}
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1">{t('Workload Management')}</Title>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Section 2: Alert banner (conditional) */}
      {loaded && (
        <AlertBanner clusterQueues={queues} pendingWorkloads={pendingWorkloads} />
      )}

      {/* Section 3: Summary statistics */}
      <PageSection>
        <SummaryStatistics
          clusterQueues={queues}
          allWorkloads={workloads}
          pendingWorkloads={pendingWorkloads}
          loaded={loaded}
        />
      </PageSection>

      {/* Section 4: Health + Utilization */}
      <PageSection>
        <Grid hasGutter>
          <GridItem span={12} lg={6}>
            <QueueHealthCard clusterQueues={queues} loaded={loaded} />
          </GridItem>
          <GridItem span={12} lg={6}>
            <ResourceUtilizationCard clusterQueues={queues} loaded={loaded} />
          </GridItem>
        </Grid>
      </PageSection>

      {/* Section 5: Activity + Pending Workloads */}
      <PageSection>
        <Grid hasGutter>
          <GridItem span={12} lg={5}>
            <RecentActivityCard
              clusterQueues={queues}
              allWorkloads={workloads}
              loaded={loaded}
            />
          </GridItem>
          <GridItem span={12} lg={7}>
            <PendingWorkloadsTable pendingWorkloads={pendingWorkloads} loaded={loaded} />
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
}

export default function OverviewDashboard() {
  return (
    <ErrorBoundary fallbackTitle="Error loading dashboard">
      <OverviewDashboardContent />
    </ErrorBoundary>
  );
}
