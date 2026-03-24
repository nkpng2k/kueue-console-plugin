import { useTranslation } from 'react-i18next';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Label } from '@patternfly/react-core';
import { K8sCondition } from '../../types';
import { getTimeSince } from '../../utils/kueue-helpers';

interface ConditionsTableProps {
  conditions: K8sCondition[] | undefined;
}

export const ConditionsTable: React.FC<ConditionsTableProps> = ({ conditions }) => {
  const { t } = useTranslation('plugin__kueue-console-plugin');

  if (!conditions || conditions.length === 0) {
    return <div>{t('No conditions available')}</div>;
  }

  return (
    <Table aria-label={t('Conditions')} variant="compact">
      <Thead>
        <Tr>
          <Th>Type</Th>
          <Th>{t('Status')}</Th>
          <Th>Reason</Th>
          <Th>Message</Th>
          <Th>Last Transition</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions.map((condition) => (
          <Tr key={condition.type}>
            <Td dataLabel="Type">{condition.type}</Td>
            <Td dataLabel="Status">
              <Label
                color={
                  condition.status === 'True'
                    ? 'green'
                    : condition.status === 'False'
                      ? 'red'
                      : 'grey'
                }
              >
                {condition.status}
              </Label>
            </Td>
            <Td dataLabel="Reason">{condition.reason ?? '-'}</Td>
            <Td dataLabel="Message">{condition.message ?? '-'}</Td>
            <Td dataLabel="Last Transition">
              {getTimeSince(condition.lastTransitionTime)}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
