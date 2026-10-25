import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiFolder, FiTrash2, FiX } from 'react-icons/fi';
import {
  BomItemResponse,
  BomStatus,
  DocumentKind,
  DocumentResponse,
  GearItemAdminResponse,
  ProjectDetailResponse,
  UpdateBomItemDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { SelectField, TextAreaField, TextField } from '~/components/ControlledFields';
import { Loader } from '~/components/Loader';
import { useSidePanelReady } from '~/components/Modal';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { PanelScroll } from '~/routes/Projects/components/PanelScroll';
import { PickDocumentModal } from '~/routes/Documents/modals/PickDocumentModal';
import { apiUrl } from '~/routes/Documents/utils';
import { BOM_KINDS } from '~/routes/Projects/bomKinds';
import { BOM_GROUP_ICON, KindPicker } from '~/routes/Projects/components/KindPicker';
import { Comments } from '~/routes/Projects/components/Comments';
import { ProjectDocuments } from '~/routes/Projects/components/ProjectDocuments';
import { useProjectStyles } from '~/routes/Projects/components/shared';
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

  /** A field saved on leaving it; Enter leaves it too. */
  const field = (key: keyof Draft, label: string, extra: Partial<React.ComponentProps<typeof TextField>> = {}) => (
    <TextField
      label={label}
      disabled={!editable}
      value={draft[key]}
      onChange={(value) => setDraft({ ...draft, [key]: value })}
      onCommit={blur(key)}
      onEnter={() => (document.activeElement as HTMLElement | null)?.blur()}
      {...extra}
    />
  );

  return (
    <PanelScroll>
      <div style={styles.container}>
        <PartPhoto item={item} editable={editable} onChanged={take} />
        {field('name', 'Part')}
        <div style={shared.fieldGrid}>
          <KindPicker
            label='Kind'
            value={item.kind}
            disabled={!editable}
            onChange={(kind) => kind !== item.kind && save({ kind })}
          />
          <SelectField
            label='Status'
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
          <div style={styles.pair}>
            {field('quantity', 'Quantity', { inputMode: 'decimal', style: styles.wide })}
            {field('unit', 'Unit', { placeholder: 'pcs, m, kg', style: styles.narrow })}
          </div>
          <div style={styles.pair}>
            {field('unitPrice', 'Price per unit', { inputMode: 'decimal', style: styles.wide })}
            {field('currency', 'Currency', {
              maxLength: 3,
              placeholder: 'PLN',
              transform: (value) => value.toUpperCase(),
              style: styles.narrow,
            })}
          </div>
          <Readout label='Cost' value={item.cost !== null ? formatMoney(item.cost, item.currency) : '—'} strong />
          {field('supplier', 'Supplier', { placeholder: 'Shop or maker' })}
          {field('url', 'Link', { placeholder: 'https://…' })}
        </div>
        {pickGear ? (
          <SelectField
            label='Gear'
            value={item.gearItem?.id ?? ''}
            options={[
              { value: '', label: 'Not a piece of gear' },
              ...gear.map((g) => ({ value: g.id, label: `${g.brand} ${g.model}` })),
            ]}
            onChange={(gearItemId) => save({ gearItemId: gearItemId || null })}
          />
        ) : item.gearItem ? (
          <Readout label='Gear' value={`${item.gearItem.brand} ${item.gearItem.model}`} />
        ) : null}
        <TextAreaField
          label='Note'
          rows={3}
          disabled={!editable}
          value={draft.note}
          placeholder='Size, thread, alternatives…'
          onChange={(note) => setDraft({ ...draft, note })}
          onCommit={blur('note')}
        />

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
    </PanelScroll>
  );
};

/** A value that is worked out, not typed: shaped like the fields around it. */
const Readout = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => {
  const styles = useStyles();
  return (
    <div style={styles.readout}>
      <span style={styles.readoutLabel}>{label}</span>
      <span style={{ ...styles.readoutValue, ...(strong ? { fontWeight: 700 } : null) }}>{value}</span>
    </div>
  );
};

/**
 * The part's own photo: uploaded here, it lands among the part's files as an
 * image and shows in the parts list. Removing it keeps the file.
 */
const PartPhoto = ({
  item,
  editable,
  onChanged,
}: {
  item: BomItemResponse;
  editable: boolean;
  onChanged: (item?: BomItemResponse) => void;
}) => {
  const styles = useStyles();
  const toast = useToast();
  const { buildsApi } = useApi();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const picker = useModal('bom-photo-pick', PickDocumentModal, { title: 'A photo from your library' });
  const Icon = BOM_GROUP_ICON[BOM_KINDS[item.kind].group];

  const run = async (action: () => Promise<{ data: { items: BomItemResponse[] } }>, failure: string) => {
    setBusy(true);
    try {
      const { data } = await action();
      onChanged(data.items.find((i) => i.id === item.id));
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!item.photo && !editable) return null;

  return (
    <div style={styles.photoRow}>
      {item.photo ? (
        <a href={apiUrl(item.photo.previewUrl)} target='_blank' rel='noreferrer' style={styles.photo}>
          <img src={apiUrl(item.photo.thumbUrl)} alt={item.name} style={styles.photoImage} />
        </a>
      ) : (
        <span style={styles.photo}>
          <Icon size={28} />
        </span>
      )}
      {editable ? (
        <div style={styles.photoActions}>
          <input
            ref={input}
            type='file'
            accept='image/*'
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file || !buildsApi) return;
              run(() => buildsApi.bomPhotoControllerUpload({ itemId: item.id, file }), 'Could not upload the photo.');
            }}
          />
          <Button
            label={busy ? 'Uploading…' : item.photo ? 'Change photo' : 'Add photo'}
            variant='secondary'
            icon={<FiCamera size={14} />}
            disabled={busy}
            onClick={() => input.current?.click()}
          />
          <Button
            label='From library'
            variant='secondary'
            icon={<FiFolder size={14} />}
            disabled={busy}
            onClick={() =>
              picker.show({
                kind: DocumentKind.Image,
                onPick: (doc: DocumentResponse) =>
                  buildsApi &&
                  run(
                    () =>
                      buildsApi.buildControllerSetBomPhoto({ itemId: item.id, setBomPhotoDto: { documentId: doc.id } }),
                    'Could not use that photo.',
                  ),
              })
            }
          />
          {item.photo ? (
            <Button
              label='Remove'
              variant='secondary'
              icon={<FiX size={14} />}
              disabled={busy}
              onClick={() =>
                buildsApi &&
                run(() => buildsApi.buildControllerClearBomPhoto({ itemId: item.id }), 'Could not remove the photo.')
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  photo: {
    width: 120,
    height: 120,
    flexShrink: 0,
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: t.colors.blue04,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  photoImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  photoActions: { gap: t.spacing.s },
  container: { gap: t.spacing.m, paddingBottom: t.spacing.l },
  section: { gap: t.spacing.s, paddingTop: t.spacing.s },
  pair: { flexDirection: 'row', gap: t.spacing.s, minWidth: 0 },
  wide: { flex: 3, minWidth: 0 },
  narrow: { flex: 2, minWidth: 0 },
  // Same box as a filled field (label 6px from the top, value below), without the input.
  readout: {
    gap: 2,
    minWidth: 0,
    padding: `6px ${t.spacing.m}px ${t.spacing.sm}px`,
    boxSizing: 'border-box',
    minHeight: 60,
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.3),
  },
  readoutLabel: { fontSize: 12, color: t.colors.blue04 },
  readoutValue: { fontSize: 16, color: t.colors.white, wordBreak: 'break-word' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
}));
