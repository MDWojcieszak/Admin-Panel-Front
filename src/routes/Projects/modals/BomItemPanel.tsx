import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { BomItemResponse, BomStatus, GearItemAdminResponse, ProjectDetailResponse, UpdateBomItemDto } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useSidePanelReady } from '~/components/Modal';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { Comments } from '~/routes/Projects/components/Comments';
import { ProjectDocuments } from '~/routes/Projects/components/ProjectDocuments';
import { Field, PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
import { BOM_STATUS_LABEL, canCheck, canEdit, formatMoney, SAFE_URL } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type BomItemPanelProps = {
  itemId: string;
  project: ProjectDetailResponse;
} & Partial<InternalModalProps>;

type Draft = Record<'name' | 'quantity' | 'unit' | 'unitPrice' | 'currency' | 'supplier' | 'url' | 'note', string>;

const toDraft = (item: BomItemResponse): Draft => ({
  name: item.name,
  quantity: String(item.quantity),
  unit: item.unit ?? '',
  unitPrice: item.unitPrice != null ? String(item.unitPrice) : '',
  currency: item.currency ?? '',
  supplier: item.supplier ?? '',
  url: item.url ?? '',
  note: item.note ?? '',
});

/** One part: where it comes from, what it costs, its files and the talk about it. */
export const BomItemPanel = (p: BomItemPanelProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const ready = useSidePanelReady();
  const toast = useToast();
  const can = useCan();
  const { buildsApi, gearApi } = useApi();
  const [item, setItem] = useState<BomItemResponse>();
  const [draft, setDraft] = useState<Draft>();
  const [gear, setGear] = useState<GearItemAdminResponse[]>([]);
  const editable = canEdit(p.project.role);
  const checkable = canCheck(p.project.role, p.project.viewersCanCheck);
  // The gear catalog is behind gallery.manage; without it the link is shown, not chosen.
  const pickGear = editable && can('gallery.manage');

  const take = (found?: BomItemResponse) => {
    if (!found) {
      p.handleClose?.();
      return;
    }
    setItem(found);
    setDraft(toDraft(found));
  };

  useEffect(() => {
    if (!ready || !buildsApi) return;
    buildsApi
      .buildControllerListBom({ id: p.project.id })
      .then(({ data }) => take(data.items.find((i) => i.id === p.itemId)))
      .catch(() => p.handleClose?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, buildsApi, p.itemId]);

  useEffect(() => {
    if (!pickGear || !gearApi) return;
    gearApi
      .gearControllerListItems({})
      .then(({ data }) => setGear(data.items))
      .catch(() => setGear([]));
  }, [pickGear, gearApi]);

  if (!item || !draft) return <Loader />;

  const save = async (dto: UpdateBomItemDto) => {
    if (!buildsApi) return;
    try {
      const { data } = await buildsApi.buildControllerUpdateBomItem({ itemId: item.id, updateBomItemDto: dto });
      take(data.items.find((i) => i.id === item.id));
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the part.'), 'error');
      setDraft(toDraft(item));
    }
  };

  const number = (value: string) => (value.trim() ? Number(value.replace(',', '.')) : null);
  const text = (value: string) => value.trim() || null;

  /** Saves a field on leaving it, when it changed and makes sense. */
  const blur = (key: keyof Draft) => () => {
    const value = draft[key];
    if (value === toDraft(item)[key]) return;
    switch (key) {
      case 'name':
        return value.trim() ? save({ name: value.trim() }) : setDraft(toDraft(item));
      case 'quantity': {
        const n = number(value);
        return n !== null && n >= 0 ? save({ quantity: n }) : setDraft(toDraft(item));
      }
      case 'unitPrice': {
        const n = number(value);
        return n === null || n >= 0 ? save({ unitPrice: n }) : setDraft(toDraft(item));
      }
      case 'currency':
        return /^[A-Z]{3}$/.test(value) || !value ? save({ currency: text(value) }) : setDraft(toDraft(item));
      case 'url':
        if (value && !SAFE_URL.test(value)) {
          toast('A link starts with http:// or https://', 'error');
          return setDraft(toDraft(item));
        }
        return save({ url: text(value) });
      default:
        return save({ [key]: text(value) });
    }
  };

  const input = (key: keyof Draft, extra: Partial<JSX.IntrinsicElements['input']> = {}) => (
    <input
      style={shared.textInput}
      disabled={!editable}
      value={draft[key]}
      onChange={(e) =>
        setDraft({ ...draft, [key]: key === 'currency' ? e.target.value.toUpperCase() : e.target.value })
      }
      onBlur={blur(key)}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      {...extra}
    />
  );

  return (
    <div style={styles.container}>
      <Field label='Part'>{input('name')}</Field>
      <div style={shared.fieldGrid}>
        <Field label='Status'>
          <PlainSelect
            value={item.status}
            disabled={!checkable}
            options={Object.values(BomStatus).map((value) => ({ value, label: BOM_STATUS_LABEL[value] }))}
            onChange={async (status) => {
              if (!buildsApi) return;
              try {
                const { data } = await buildsApi.buildControllerSetBomStatus({
                  itemId: item.id,
                  setBomStatusDto: { status: status as BomStatus },
                });
                take(data.items.find((i) => i.id === item.id));
              } catch (e) {
                toast(getApiErrorMessage(e, 'Could not change the part.'), 'error');
              }
            }}
          />
        </Field>
        <Field label='Quantity'>
          <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
            {input('quantity', { inputMode: 'decimal', style: { ...shared.textInput, flex: 2 } })}
            {input('unit', { placeholder: 'unit', style: { ...shared.textInput, flex: 1 } })}
          </div>
        </Field>
        <Field label='Price per unit'>
          <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
            {input('unitPrice', { inputMode: 'decimal', style: { ...shared.textInput, flex: 2 } })}
            {input('currency', {
              maxLength: 3,
              placeholder: 'PLN',
              style: { ...shared.textInput, ...shared.mono, flex: 1 },
            })}
          </div>
        </Field>
        <Field label='Cost'>
          <span style={styles.cost}>{item.cost !== null ? formatMoney(item.cost, item.currency) : '—'}</span>
        </Field>
        <Field label='Supplier'>{input('supplier', { placeholder: 'Shop or maker' })}</Field>
        <Field label='Link'>{input('url', { placeholder: 'https://…' })}</Field>
      </div>
      {pickGear || item.gearItem ? (
        <Field label='Gear'>
          {pickGear ? (
            <PlainSelect
              value={item.gearItem?.id ?? ''}
              options={[
                { value: '', label: 'Not a piece of gear' },
                ...gear.map((g) => ({ value: g.id, label: `${g.brand} ${g.model}` })),
              ]}
              onChange={(gearItemId) => save({ gearItemId: gearItemId || null })}
            />
          ) : (
            <span style={{ fontSize: 14 }}>
              {item.gearItem!.brand} {item.gearItem!.model}
            </span>
          )}
        </Field>
      ) : null}
      <Field label='Note'>
        <textarea
          style={shared.textArea}
          rows={3}
          disabled={!editable}
          value={draft.note}
          placeholder='Size, thread, alternatives…'
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          onBlur={blur('note')}
        />
      </Field>

      <div style={styles.section}>
        <span style={shared.fieldLabel}>Files</span>
        <ProjectDocuments compact target={{ bomItemId: item.id }} projectId={p.project.id} editable={editable} />
      </div>

      <div style={styles.section}>
        <span style={shared.fieldLabel}>Comments</span>
        <Comments target={{ bomItemId: item.id }} projectId={p.project.id} />
      </div>

      {editable ? (
        <div style={styles.footer}>
          <Button
            label='Remove part'
            variant='danger'
            icon={<FiTrash2 size={14} />}
            onClick={async () => {
              if (!buildsApi) return;
              try {
                await buildsApi.buildControllerRemoveBomItem({ itemId: item.id });
                p.handleClose?.();
              } catch (e) {
                toast(getApiErrorMessage(e, 'Could not remove the part.'), 'error');
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.l, paddingBottom: t.spacing.l },
  section: { gap: t.spacing.s },
  cost: { fontSize: 16, fontWeight: 700, color: t.colors.white, lineHeight: '38px' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
}));
