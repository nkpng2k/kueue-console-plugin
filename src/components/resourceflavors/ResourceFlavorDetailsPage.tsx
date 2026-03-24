import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DocumentTitle,
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
  Label,
  LabelGroup,
} from '@patternfly/react-core';
import { ResourceFlavorModel } from '../../types';
import { useResourceFlavor } from '../../hooks/useKueueResources';
import { ErrorBoundary } from '../shared/ErrorBoundary';

function ResourceFlavorDetailsContent() {
  const { t } = useTranslation('plugin__kueue-console-plugin');
  const params = useParams<{ name: string }>();
  const name = params.name ?? '';
  const { resourceFlavor, loaded } = useResourceFlavor(name);

  if (!loaded || !resourceFlavor) return null;

  const labels = resourceFlavor.spec?.nodeLabels ?? {};
  const taints = resourceFlavor.spec?.nodeTaints ?? [];
  const tolerations = resourceFlavor.spec?.tolerations ?? [];

  return (
    <>
      <DocumentTitle>{`${t('ResourceFlavor details')} · ${name}`}</DocumentTitle>
      <PageSection variant="default">
        <Title headingLevel="h1">
          <ResourceLink
            groupVersionKind={ResourceFlavorModel}
            name={name}
            linkTo={false}
          />
        </Title>
      </PageSection>
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
                      {resourceFlavor.metadata?.name}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp timestamp={resourceFlavor.metadata?.creationTimestamp} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </FlexItem>

          <FlexItem>
            <Card>
              <CardTitle>Node Labels</CardTitle>
              <CardBody>
                {Object.keys(labels).length > 0 ? (
                  <LabelGroup>
                    {Object.entries(labels).map(([key, value]) => (
                      <Label key={key}>{key}={value}</Label>
                    ))}
                  </LabelGroup>
                ) : (
                  <div>No node labels configured.</div>
                )}
              </CardBody>
            </Card>
          </FlexItem>

          {taints.length > 0 && (
            <FlexItem>
              <Card>
                <CardTitle>Node Taints</CardTitle>
                <CardBody>
                  <LabelGroup>
                    {taints.map((taint, idx) => (
                      <Label key={idx} color="orange">
                        {taint.key}={taint.value ?? ''}:{taint.effect}
                      </Label>
                    ))}
                  </LabelGroup>
                </CardBody>
              </Card>
            </FlexItem>
          )}

          {tolerations.length > 0 && (
            <FlexItem>
              <Card>
                <CardTitle>Tolerations</CardTitle>
                <CardBody>
                  <LabelGroup>
                    {tolerations.map((toleration, idx) => (
                      <Label key={idx} color="blue">
                        {toleration.key}
                        {toleration.operator === 'Exists' ? ' (Exists)' : `=${toleration.value}`}
                        :{toleration.effect ?? 'All'}
                      </Label>
                    ))}
                  </LabelGroup>
                </CardBody>
              </Card>
            </FlexItem>
          )}
        </Flex>
      </PageSection>
    </>
  );
}

export default function ResourceFlavorDetailsPage() {
  return (
    <ErrorBoundary fallbackTitle="Error loading ResourceFlavor details">
      <ResourceFlavorDetailsContent />
    </ErrorBoundary>
  );
}
