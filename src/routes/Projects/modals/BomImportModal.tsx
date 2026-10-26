import { useMemo } from 'react';
import { CreateBomItemDto } from '~/api/api';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { bomSchema } from '~/routes/Projects/import/bomSchema';
import { ImportModal } from '~/routes/Projects/import/ImportModal';

type BomImportModalProps = {
  projectId: string;
  projectTitle?: string;
  /** For prices that come without a currency: the one the parts list uses. */
  defaultCurrency?: string | null;
  onDone?: () => void;
} & Partial<InternalModalProps>;

/** Parts in bulk, from a spreadsheet, our own export or a chat's answer. */
export const BomImportModal = (p: BomImportModalProps) => {
  const { buildsApi } = useApi();
  const schema = useMemo(() => bomSchema(p.defaultCurrency ?? null), [p.defaultCurrency]);

  return (
    <ImportModal<CreateBomItemDto>
      schema={schema}
      fileName={p.projectTitle ? `${p.projectTitle} parts` : 'Parts'}
      onDone={p.onDone}
      handleClose={p.handleClose}
      importRow={async (dto) => {
        if (!buildsApi) return;
        await buildsApi.buildControllerAddBomItem({ id: p.projectId, createBomItemDto: dto });
      }}
    />
  );
};
