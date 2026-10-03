import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiFolder,
  FiHelpCircle,
  FiLock,
  FiRotateCcw,
  FiSlash,
  FiUploadCloud,
} from 'react-icons/fi';

import { Badge, BadgeTone } from '~/components/Badge';
import { Button } from '~/components/Button';
import { DateInput } from '~/components/DateInput';
import { Input } from '~/components/Input';
import { Scrollbar } from '~/components/Scrollbar';
import { EntryCommentsPanel } from '~/routes/PhotoManagement/components/EntryCommentsPanel';
import { EntryGearPanel } from '~/routes/PhotoManagement/components/EntryGearPanel';
import { EntryLocationEditor } from '~/routes/PhotoManagement/components/EntryLocationEditor';
import { EntryProgressPanel } from '~/routes/PhotoManagement/components/EntryProgressPanel';
import { EntryPublishPanel } from '~/routes/PhotoManagement/components/EntryPublishPanel';
import { EntryForecastPanel } from '~/routes/PhotoManagement/components/EntryForecastPanel';
import { EntrySkyPanel } from '~/routes/PhotoManagement/components/EntrySkyPanel';
import { ImmichAlbumsSection } from '~/routes/PhotoManagement/components/ImmichAlbumsSection';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { isOverduePlan } from '~/routes/PhotoManagement/utils/kanban';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';
import {
  MediaStatus,
  PatchPhotoEntryDto,
  PhotoEntryDetailsResponse,
  PhotoEntryLocationDto,
  PhotoEntryPostStage,
  PhotoEntryStatus,
  PhotoEntryType,
} from '~/api/api';

type AstroObjectListItem = {
  id: string;
  name: string;
  code?: string;
  aliases?: string;
};

type PhotoEntryAstroRelation = {
  astroObjectId?: string;
  rootPath?: string | null;
  astroObject?: {
    id?: string;
  };
};

type PhotoEntryDetailsModalProps = Partial<InternalModalProps> & {
  entry?: PhotoEntryDetailsResponse;
  astroObjects?: AstroObjectListItem[];
  onSaved?: () => void | Promise<void>;
  /** Jump to the Immich Albums tab for this entry (navigation lives in the routed parent). */
  onAddToAlbum?: (entryId: string) => void;
};

const photoEntryDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Optional even for ASTRO: an empty array clears objects (general-sky session).
  selectedAstroObjectIds: z.array(z.string()).optional(),
});

type PhotoEntryDetailsFormValues = z.infer<typeof photoEntryDetailsSchema>;

const getRelationAstroObjectId = (item: PhotoEntryAstroRelation): string | undefined => {
  return item.astroObjectId || item.astroObject?.id;
};

const mapAstroObjectIds = (astroObjects: Array<object> | undefined): string[] => {
  if (!astroObjects?.length) return [];

  return (astroObjects as PhotoEntryAstroRelation[])
    .map(getRelationAstroObjectId)
    .filter((id): id is string => Boolean(id));
};

const NO_WRAP = { flexShrink: 0, whiteSpace: 'nowrap' } as const;

const STATUS_META: Record<PhotoEntryStatus, { label: string; tone: BadgeTone }> = {
  [PhotoEntryStatus.Planned]: { label: 'Planned', tone: 'neutral' },
  [PhotoEntryStatus.Shot]: { label: 'Shot', tone: 'green' },
  [PhotoEntryStatus.Cancelled]: { label: 'Cancelled', tone: 'red' },
};

const STAGE_LABELS: Record<PhotoEntryPostStage, string> = {
  [PhotoEntryPostStage.None]: 'Not touched yet',
  [PhotoEntryPostStage.Selecting]: 'Selecting',
  [PhotoEntryPostStage.Editing]: 'Editing',
  [PhotoEntryPostStage.Finished]: 'Finished',
};

const TYPE_TONE: Record<PhotoEntryType, BadgeTone> = {
  [PhotoEntryType.General]: 'green',
  [PhotoEntryType.Work]: 'blue',
  [PhotoEntryType.Astro]: 'purple',
};

/** What the card is for at this point in the session's life, in one line. */
const describeFocus = (entry: PhotoEntryDetailsResponse): string => {
  if (entry.status === PhotoEntryStatus.Cancelled) return 'Cancelled — kept for the record.';
  if (entry.status === PhotoEntryStatus.Planned) return 'Planning — what to take, and what still has to be bought.';
  if (entry.postStage === PhotoEntryPostStage.None) return 'Shot — get the material off the gear, then count it.';
  if (entry.postStage === PhotoEntryPostStage.Finished) return 'Finished — the numbers and notes below are the record.';
  return 'In post-production — progress first, gear below.';
};

export const PhotoEntryDetailsModal = (p: PhotoEntryDetailsModalProps) => {
  const styles = useStyles();
  const { photoEntryApi } = useApi();
  const toast = useToast();
  const [resolvingPlan, setResolvingPlan] = useState<PhotoEntryStatus | null>(null);

  // Local copy: re-showing an already-visible modal does not refresh its props,
  // so after a save the card would keep rendering the name it was opened with.
  const [entry, setEntry] = useState(p.entry);
  // Nothing is editable until asked for. A card that opens as a form invites
  // accidental changes and hides what the session currently says.
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { width: viewportWidth } = useViewportSize();
  const stacked = viewportWidth > 0 && viewportWidth < 1000;

  useEffect(() => {
    setEntry(p.entry);
    setEditing(false);
  }, [p.entry]);

  const astroObjects = useMemo(() => p.astroObjects ?? [], [p.astroObjects]);
  const isLocked = entry.foldersCreated;
  // Bumped when an action outside the gear panel changes its rows (marking the
  // material uploaded ticks every card), so the panel reloads them.
  const [gearVersion, setGearVersion] = useState(0);
  // Publishing takes the card's body over rather than opening a modal: only one
  // modal shows at a time, and this card already is one.
  const [publishing, setPublishing] = useState(false);
  const canPublish =
    entry.foldersCreated && (entry.type === PhotoEntryType.General || entry.type === PhotoEntryType.Work);
  const uploadStatus = entry.uploadStatus;
  const isAstro = entry.type === PhotoEntryType.Astro;

  const initialSelectedAstroObjectIds = useMemo(() => mapAstroObjectIds(entry.astroObjects), [entry.astroObjects]);

  const formMethods = useForm<PhotoEntryDetailsFormValues>({
    resolver: zodResolver(photoEntryDetailsSchema),
    defaultValues: {
      name: entry.name ?? '',
      startDate: toInputDate(entry.startDate),
      endDate: toInputDate(entry.endDate),
      selectedAstroObjectIds: initialSelectedAstroObjectIds,
    },
  });

  const resetForm = (source: PhotoEntryDetailsResponse) =>
    formMethods.reset({
      name: source.name ?? '',
      startDate: toInputDate(source.startDate),
      endDate: toInputDate(source.endDate),
      selectedAstroObjectIds: mapAstroObjectIds(source.astroObjects),
    });

  useEffect(() => {
    resetForm(entry);
    setConfirmDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  const startDate = useWatch({ control: formMethods.control, name: 'startDate' });
  const selectedAstroObjectIds = useWatch({
    control: formMethods.control,
    name: 'selectedAstroObjectIds',
    defaultValue: initialSelectedAstroObjectIds,
  });

  const assignedAstroObjects = useMemo(() => {
    const ids = new Set(initialSelectedAstroObjectIds);
    return astroObjects.filter((astroObject) => ids.has(astroObject.id));
  }, [astroObjects, initialSelectedAstroObjectIds]);

  const canCreateFolders = !entry.foldersCreated && Boolean(entry.startDate && entry.endDate);

  const reloadEntry = async () => {
    if (!photoEntryApi) return;
    const { data } = await photoEntryApi.photoEntryControllerGetById({ id: entry.id });
    setEntry(data);
  };

  /** Gear, counts and comments all change what the header and the board show. */
  const refresh = async () => {
    await reloadEntry();
    await p.onSaved?.();
  };

  const toggleAstroObject = (astroObjectId: string) => {
    const current = selectedAstroObjectIds ?? [];
    const exists = current.includes(astroObjectId);

    formMethods.setValue(
      'selectedAstroObjectIds',
      exists ? current.filter((id) => id !== astroObjectId) : [...current, astroObjectId],
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const handleSave = async (data: PhotoEntryDetailsFormValues) => {
    if (!photoEntryApi || isLocked) return;

    setLoading(true);
    setConfirmDelete(false);

    try {
      const payload: PatchPhotoEntryDto = {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        astroObjectIds: isAstro ? data.selectedAstroObjectIds || [] : [],
      };

      await photoEntryApi.photoEntryControllerPatch({
        id: entry.id,
        patchPhotoEntryDto: payload,
      });

      await reloadEntry();
      setEditing(false);
      await p.onSaved?.();
    } catch (error) {
      console.log((error as Error)?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolders = async () => {
    if (!photoEntryApi || !canCreateFolders) return;

    setFoldersLoading(true);

    try {
      await photoEntryApi.photoEntryControllerCreateFolders({
        id: entry.id,
      });

      // The card stays open: the lock note and the upload banner appear in place.
      await refresh();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the folders.'), 'error');
    } finally {
      setFoldersLoading(false);
    }
  };

  /**
   * Status changes the card offers itself: cancelling or restoring a plan, and
   * answering "did it happen?" once its dates have passed. The board has no lane
   * for CANCELLED, so this is the only place a session can be cancelled.
   */
  const changeStatus = async (status: PhotoEntryStatus) => {
    if (!photoEntryApi) return;
    setResolvingPlan(status);
    try {
      await photoEntryApi.photoEntryControllerPatchStatus({
        id: entry.id,
        patchPhotoEntryStatusDto: { status },
      });
      await refresh();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not update the session.'), 'error');
    } finally {
      setResolvingPlan(null);
    }
  };

  const handleMarkAsUploaded = async () => {
    if (!photoEntryApi || uploadStatus === MediaStatus.Uploaded) return;

    setFoldersLoading(true);

    try {
      await photoEntryApi.photoEntryControllerMarkMediaUploaded({
        id: entry.id,
      });

      await refresh();
      setGearVersion((v) => v + 1);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not mark the material as uploaded.'), 'error');
    } finally {
      setFoldersLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!photoEntryApi || isLocked) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleteLoading(true);

    try {
      await photoEntryApi.photoEntryControllerDelete({ id: entry.id });
      await p.handleClose?.();
    } catch (error) {
      console.log((error as Error)?.message);
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  };

  const cancelEditing = () => {
    resetForm(entry);
    setConfirmDelete(false);
    setEditing(false);
  };

  const [savingLocation, setSavingLocation] = useState(false);
  const saveLocation = async (location: PhotoEntryLocationDto | null) => {
    if (!photoEntryApi) return;
    setSavingLocation(true);
    try {
      await photoEntryApi.photoEntryControllerPatch({ id: entry.id, patchPhotoEntryDto: { location } });
      await refresh();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the location.'), 'error');
    } finally {
      setSavingLocation(false);
    }
  };

  // Refetches the sky and the forecast when the place or the dates change.
  const skyKey = [entry.location?.latitude, entry.location?.longitude, entry.startDate, entry.endDate].join('|');

  const skySection = (
    <Section key='sky' title='Location & sky'>
      <EntryLocationEditor location={entry.location} saving={savingLocation} onSave={saveLocation} />
      {entry.location && entry.startDate ? (
        <>
          <EntrySkyPanel entryId={entry.id} reloadKey={skyKey} />
          <EntryForecastPanel entryId={entry.id} reloadKey={skyKey} />
        </>
      ) : entry.location ? (
        <span style={styles.muted}>Set the dates to see the sky for this trip.</span>
      ) : null}
    </Section>
  );

  const gearSection = (
    <Section key='gear'>
      <EntryGearPanel key={gearVersion} entryId={entry.id} onChanged={refresh} />
    </Section>
  );

  const progressSection = (
    <Section key='progress' title='Progress' hint='How far the material has got.'>
      <EntryProgressPanel entry={entry} onChanged={refresh} />
    </Section>
  );

  // The card follows the session's phase instead of one fixed order. Before the
  // shoot there is nothing to count, so progress is not shown at all and the
  // gear list leads; straight after it, securing the material comes first; once
  // post-production has started, the numbers do.
  // Where and under what sky leads while planning; once shot it is history.
  const mainSections =
    entry.status === PhotoEntryStatus.Planned
      ? [skySection, gearSection]
      : entry.status !== PhotoEntryStatus.Shot
        ? [gearSection, skySection]
        : entry.postStage === PhotoEntryPostStage.None
          ? [gearSection, progressSection, skySection]
          : [progressSection, gearSection, skySection];

  const status = STATUS_META[entry.status];

  return (
    <FormProvider {...formMethods}>
      <Scrollbar style={styles.scroll}>
        <div style={styles.page}>
          <div style={styles.hero}>
            {editing ? (
              <div style={styles.editForm}>
                <Input name='name' label='Name' description='Photo entry name' type='text' />

                <div style={styles.row}>
                  <DateInput name='startDate' style={styles.flex} label='Start Date' description='Entry start date' />
                  <DateInput
                    name='endDate'
                    style={styles.flex}
                    label='End Date'
                    description='Entry end date'
                    min={startDate || undefined}
                  />
                </div>

                {isAstro ? (
                  <div style={styles.astroPicker}>
                    <span style={styles.factLabel}>Targets · {selectedAstroObjectIds?.length ?? 0} selected</span>
                    {astroObjects.length === 0 ? (
                      <span style={styles.muted}>No astro objects available.</span>
                    ) : (
                      <Scrollbar maxHeight={220}>
                        <div style={styles.astroList}>
                          {astroObjects.map((astroObject) => {
                            const checked = (selectedAstroObjectIds ?? []).includes(astroObject.id);

                            return (
                              <button
                                key={astroObject.id}
                                type='button'
                                onClick={() => toggleAstroObject(astroObject.id)}
                                style={{ ...styles.astroItem, ...(checked ? styles.astroItemActive : {}) }}
                              >
                                <div style={{ ...styles.checkbox, ...(checked ? styles.checkboxActive : {}) }}>
                                  {checked ? <FiCheck size={12} /> : null}
                                </div>
                                <span style={styles.astroItemTitle}>{astroObject.code || astroObject.name}</span>
                                {astroObject.code ? <span style={styles.muted}>{astroObject.name}</span> : null}
                              </button>
                            );
                          })}
                        </div>
                      </Scrollbar>
                    )}
                  </div>
                ) : null}

                <div style={styles.editActions}>
                  <Button
                    label={confirmDelete ? 'Confirm delete' : 'Delete session'}
                    style={NO_WRAP}
                    onClick={handleDelete}
                    loading={deleteLoading}
                    variant={confirmDelete ? 'danger' : 'secondary'}
                  />
                  <div style={styles.heroActions}>
                    <Button label='Cancel' variant='secondary' style={NO_WRAP} onClick={cancelEditing} />
                    <Button
                      label='Save changes'
                      style={NO_WRAP}
                      onClick={formMethods.handleSubmit(handleSave)}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={styles.heroTop}>
                  <div style={styles.titleBlock}>
                    <span style={styles.name}>{entry.name}</span>
                    <div style={styles.chips}>
                      <Badge label={entry.type} tone={TYPE_TONE[entry.type] ?? 'neutral'} />
                      <Badge label={status.label} tone={status.tone} />
                      {entry.status === PhotoEntryStatus.Shot ? (
                        <Badge
                          label={STAGE_LABELS[entry.postStage]}
                          tone={entry.postStage === PhotoEntryPostStage.Finished ? 'green' : 'blue'}
                        />
                      ) : null}
                      {entry.isHappeningNow ? <Badge label='Happening now' tone='yellow' /> : null}
                      {entry.wasEdited && entry.postStage === PhotoEntryPostStage.None ? (
                        <Badge label='Was edited' tone='neutral' />
                      ) : null}
                    </div>
                    <span style={styles.focus}>{describeFocus(entry)}</span>
                  </div>

                  <div style={styles.heroActions}>
                    {canPublish && !publishing ? (
                      <Button
                        label='Publish'
                        variant='secondary'
                        style={NO_WRAP}
                        icon={<FiUploadCloud size={14} />}
                        onClick={() => setPublishing(true)}
                      />
                    ) : null}
                    {!entry.foldersCreated ? (
                      <Button
                        label='Create folders'
                        variant='secondary'
                        style={NO_WRAP}
                        onClick={handleCreateFolders}
                        loading={foldersLoading}
                        disabled={!canCreateFolders}
                        icon={<FiFolder size={14} />}
                      />
                    ) : null}
                    {entry.status === PhotoEntryStatus.Planned && !isOverduePlan(entry) ? (
                      <Button
                        label='Cancel plan'
                        variant='secondary'
                        style={NO_WRAP}
                        icon={<FiSlash size={14} />}
                        loading={resolvingPlan === PhotoEntryStatus.Cancelled}
                        onClick={() => changeStatus(PhotoEntryStatus.Cancelled)}
                      />
                    ) : null}
                    {entry.status === PhotoEntryStatus.Cancelled ? (
                      <Button
                        label='Restore plan'
                        variant='secondary'
                        style={NO_WRAP}
                        icon={<FiRotateCcw size={14} />}
                        loading={resolvingPlan === PhotoEntryStatus.Planned}
                        onClick={() => changeStatus(PhotoEntryStatus.Planned)}
                      />
                    ) : null}
                    {isLocked ? null : (
                      <Button
                        label='Edit'
                        style={NO_WRAP}
                        icon={<FiEdit2 size={14} />}
                        onClick={() => setEditing(true)}
                      />
                    )}
                  </div>
                </div>

                <div style={styles.facts}>
                  <Fact label='DATES' value={formatRange(entry.startDate, entry.endDate)} />
                  <Fact
                    label='FOLDERS'
                    value={entry.foldersCreated ? `Created ${formatDate(entry.foldersCreatedAt)}` : 'Not created'}
                  />
                  <Fact label='ROOT PATH' value={entry.rootPath || '—'} />
                  {isAstro ? (
                    <Fact
                      label='TARGETS'
                      value={
                        assignedAstroObjects.length
                          ? assignedAstroObjects.map((item) => item.code || item.name).join(', ')
                          : 'None'
                      }
                    />
                  ) : null}
                  {/* Lives with the other facts: as a line inside the gear list it
                      pushed the list around for something rarely looked at. */}
                  {entry.gearConfirmedAt ? (
                    <Fact label='GEAR' value={`Confirmed ${formatDate(entry.gearConfirmedAt)}`} />
                  ) : null}
                  <Fact label='UPDATED' value={formatDateTime(entry.updatedAt)} />
                </div>

                {isLocked ? (
                  <span style={styles.lockNote}>
                    <FiLock size={12} /> Folders exist, so the name and dates can no longer be changed.
                  </span>
                ) : !canCreateFolders ? (
                  <span style={styles.lockNote}>Set both dates to be able to create folders.</span>
                ) : null}
              </>
            )}

            {!editing && isOverduePlan(entry) ? (
              <div style={styles.overdueBanner}>
                <FiHelpCircle size={16} />
                <div style={styles.bannerText}>
                  <span style={styles.bannerTitle}>Did it happen?</span>
                  <span>The planned dates have passed. If it was moved instead, change the dates with Edit.</span>
                </div>
                <div style={{ ...styles.bannerAction, flexDirection: 'row', gap: 8 }}>
                  <Button
                    label='It was cancelled'
                    variant='secondary'
                    style={NO_WRAP}
                    loading={resolvingPlan === PhotoEntryStatus.Cancelled}
                    disabled={Boolean(resolvingPlan)}
                    onClick={() => changeStatus(PhotoEntryStatus.Cancelled)}
                  />
                  <Button
                    label='It happened'
                    style={NO_WRAP}
                    icon={<FiCheck size={14} />}
                    loading={resolvingPlan === PhotoEntryStatus.Shot}
                    disabled={Boolean(resolvingPlan)}
                    onClick={() => changeStatus(PhotoEntryStatus.Shot)}
                  />
                </div>
              </div>
            ) : null}

            {isLocked && uploadStatus === MediaStatus.NotUploaded ? (
              <div style={styles.uploadWarningBanner}>
                <FiAlertTriangle size={16} />
                <div style={styles.bannerText}>
                  <span style={styles.bannerTitle}>Folders created</span>
                  <span>Confirm once photos are uploaded.</span>
                </div>
                <div style={styles.bannerAction}>
                  <Button
                    loading={foldersLoading}
                    label='Mark as uploaded'
                    variant='secondary'
                    style={NO_WRAP}
                    onClick={handleMarkAsUploaded}
                  />
                </div>
              </div>
            ) : null}

            {isLocked && uploadStatus === MediaStatus.Uploaded ? (
              <div style={styles.uploadSuccessBanner}>
                <FiCheckCircle size={16} />
                <div style={styles.bannerText}>
                  <span style={styles.bannerTitle}>Upload confirmed</span>
                  <span>Photos have been uploaded to the server.</span>
                </div>
                {/* Empty, but holding the button's height: ticking "Uploaded" on the
                    last item swaps one banner for the other, and without the same
                    height the whole card below jumped by the difference. */}
                <div style={styles.bannerAction} />
              </div>
            ) : null}
          </div>

          {publishing ? (
            <EntryPublishPanel entryId={entry.id} entryName={entry.name} onClose={() => setPublishing(false)} />
          ) : (
            <div style={stacked ? styles.bodyStacked : styles.body}>
              <div style={styles.bodyColumn}>
                {mainSections}

                {isLocked ? (
                  <Section>
                    <ImmichAlbumsSection photoEntryId={entry.id} onAddToAlbum={() => p.onAddToAlbum?.(entry.id)} />
                  </Section>
                ) : null}
              </div>

              <div style={styles.bodyColumn}>
                <Section title='Notes'>
                  <EntryCommentsPanel entryId={entry.id} onChanged={refresh} />
                </Section>
              </div>
            </div>
          )}
        </div>
      </Scrollbar>
    </FormProvider>
  );
};

/** A block of the card. Titled only when the panel inside does not title itself. */
const Section = ({ title, hint, children }: { title?: string; hint?: string; children: ReactNode }) => {
  const styles = useStyles();

  return (
    <div style={styles.section}>
      {title ? (
        <div style={styles.sectionHead}>
          <span style={styles.sectionTitle}>{title}</span>
          {hint ? <span style={styles.muted}>{hint}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => {
  const styles = useStyles();

  return (
    <div style={styles.fact}>
      <span style={styles.factLabel}>{label}</span>
      <span style={styles.factValue} title={value}>
        {value}
      </span>
    </div>
  );
};

const toInputDate = (value?: string | null): string => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
};

const formatDate = (value?: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString();
};

const formatRange = (start?: string | null, end?: string | null): string => {
  if (!start && !end) return 'Not set';
  return `${formatDate(start)} → ${formatDate(end)}`;
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString();
};

const useStyles = mkUseStyles((t) => ({
  scroll: { height: '100%' },
  // One page with one scroll. Three side-by-side scrolling columns read as
  // three unrelated strips; this reads as a single screen about one session.
  page: {
    gap: t.spacing.m,
    paddingRight: t.spacing.l,
    paddingBottom: t.spacing.m,
    minWidth: 0,
  },
  hero: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  titleBlock: { gap: t.spacing.xs, minWidth: 0, flex: 1 },
  name: { fontSize: 26, fontWeight: 700, lineHeight: 1.15, wordBreak: 'break-word' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, flexWrap: 'wrap' },
  focus: { fontSize: 13, color: t.colors.blue04, marginTop: 2 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  facts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: t.spacing.s,
  },
  fact: {
    gap: 2,
    minWidth: 0,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.55),
  },
  factLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: t.colors.dark05 },
  factValue: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lockNote: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    fontSize: 12,
    color: t.colors.dark05,
  },
  editForm: { gap: t.spacing.s },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  row: { display: 'flex', gap: t.spacing.m, flexDirection: 'row' },
  flex: { flex: 1 },
  muted: { fontSize: 12, color: t.colors.dark05 },
  astroPicker: { gap: t.spacing.xs },
  astroList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: t.spacing.xs,
    paddingRight: t.spacing.l,
  },
  astroItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.medium,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    minWidth: 0,
  },
  astroItemActive: {
    borderColor: 'rgba(168, 85, 247, 0.28)',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  astroItemTitle: { fontWeight: 600, fontSize: 13 },
  checkbox: {
    width: 18,
    height: 18,
    minWidth: 18,
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  checkboxActive: {
    border: '1px solid rgba(168, 85, 247, 0.32)',
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    color: '#DCC2FF',
  },
  uploadWarningBanner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    fontSize: 13,
    color: '#F08A80',
    backgroundColor: 'rgba(220, 68, 55, 0.08)',
    border: '1px solid rgba(220, 68, 55, 0.18)',
  },
  overdueBanner: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    fontSize: 13,
    color: '#E7BE63',
    backgroundColor: 'rgba(232, 179, 72, 0.08)',
    border: '1px solid rgba(232, 179, 72, 0.22)',
  },
  uploadSuccessBanner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    fontSize: 13,
    color: '#7BC8A6',
    backgroundColor: 'rgba(53, 158, 122, 0.08)',
    border: '1px solid rgba(53, 158, 122, 0.18)',
  },
  bannerText: { flex: 1, minWidth: 0, gap: 2 },
  // Sized to a Button (12px padding around a 24px line), so both banners match.
  bannerAction: { minHeight: 48, display: 'flex', alignItems: 'center' },
  bannerTitle: { fontWeight: 700 },
  body: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
    gap: t.spacing.m,
    alignItems: 'start',
  },
  bodyStacked: { gap: t.spacing.m },
  bodyColumn: { gap: t.spacing.m, minWidth: 0 },
  section: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    minWidth: 0,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    border: `1px solid ${t.colors.gray01 + t.colorOpacity(0.5)}`,
  },
  sectionHead: { gap: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 700 },
}));
