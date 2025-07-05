import { cx } from 'class-variance-authority';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { BarListProps } from '../charts/bar-list.tsx';
import { BarList } from '../charts/bar-list.tsx';
import { Modal } from '../dialogs/modals.tsx';
import { NoData } from './no-data.tsx';

interface BarListCardProps<T = unknown> {
  label: string;
  data?: BarListProps<T>['data'];
}

const MAX_BAR = 7;

export function BarListCard({ label, data = [] }: BarListCardProps) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <Card className="space-y-6 p-6 relative" aria-labelledby={id}>
      <H2 id={id}>{label}</H2>
      <div className={cx('overflow-hidden max-h-[260px]', { 'pb-6': data.length > MAX_BAR })}>
        {data.length !== 0 ? <BarList data={data} /> : <NoData />}
      </div>
      {data.length > MAX_BAR && (
        <div className="flex justify-center absolute inset-x-0 rounded-b-md bottom-0 bg-linear-to-t from-white to-transparent py-7 pt-12">
          <Button variant="secondary" onClick={onOpen}>
            {t('common.show-more')}
          </Button>
          <BarListModal label={label} data={data} open={open} onClose={onClose} />
        </div>
      )}
    </Card>
  );
}

interface BarListModalProps<T = unknown> extends BarListCardProps<T> {
  open: boolean;
  onClose: VoidFunction;
}

function BarListModal({ label, data = [], open, onClose }: BarListModalProps) {
  return (
    <Modal title={label} open={open} onClose={onClose}>
      <Modal.Content className="max-h-[500px] overflow-y-auto pr-4">
        <BarList data={data} />
      </Modal.Content>
    </Modal>
  );
}
