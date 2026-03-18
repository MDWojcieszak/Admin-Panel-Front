import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiCheck, FiFolder, FiLock, FiMoon } from 'react-icons/fi';

import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Scrollbar } from '~/components/Scrollbar';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';
import { PatchPhotoEntryDto, PhotoEntryDetailsResponse, PhotoEntryType } from '~/api/api';

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

type MatchedAstroObjectItem = AstroObjectListItem & {
  relationRootPath?: string | null;
};

type PhotoEntryDetailsModalProps = Partial<InternalModalProps> & {
  entry?: PhotoEntryDetailsResponse;
  astroObjects?: AstroObjectListItem[];
  onSaved?: () => void | Promise<void>;
  onFoldersCreated?: () => void | Promise<void>;
};

const buildPhotoEntryDetailsSchema = (entryType: PhotoEntryType) =>
  z
    .object({
      name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      selectedAstroObjectIds: z.array(z.string()).optional(),
    })
    .superRefine((data, ctx) => {
      if (
        entryType === PhotoEntryType.Astro &&
        (!data.selectedAstroObjectIds || data.selectedAstroObjectIds.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['selectedAstroObjectIds'],
          message: 'Select at least one astro object',
        });
      }
    });

type PhotoEntryDetailsFormValues = z.infer<ReturnType<typeof buildPhotoEntryDetailsSchema>>;

const getRelationAstroObjectId = (item: PhotoEntryAstroRelation): string | undefined => {
  return item.astroObjectId || item.astroObject?.id;
};

const mapAstroObjectIds = (astroObjects: Array<object> | undefined): string[] => {
  if (!astroObjects?.length) return [];

  return (astroObjects as PhotoEntryAstroRelation[])
    .map(getRelationAstroObjectId)
    .filter((id): id is string => Boolean(id));
};

export const PhotoEntryDetailsModal = (p: PhotoEntryDetailsModalProps) => {
  const styles = useStyles();
  const { photoEntryApi } = useApi();

  const [loading, setLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const astroObjects = useMemo(() => p.astroObjects ?? [], [p.astroObjects]);
  const isLocked = p.entry.foldersCreated;
  const isAstro = p.entry.type === PhotoEntryType.Astro;

  const initialSelectedAstroObjectIds = useMemo(() => mapAstroObjectIds(p.entry.astroObjects), [p.entry.astroObjects]);

  const formMethods = useForm<PhotoEntryDetailsFormValues>({
    resolver: zodResolver(buildPhotoEntryDetailsSchema(p.entry.type)),
    defaultValues: {
      name: p.entry.name ?? '',
      startDate: toInputDate(p.entry.startDate),
      endDate: toInputDate(p.entry.endDate),
      selectedAstroObjectIds: initialSelectedAstroObjectIds,
    },
  });

  useEffect(() => {
    formMethods.reset({
      name: p.entry.name ?? '',
      startDate: toInputDate(p.entry.startDate),
      endDate: toInputDate(p.entry.endDate),
      selectedAstroObjectIds: mapAstroObjectIds(p.entry.astroObjects),
    });
    setConfirmDelete(false);
  }, [p.entry, formMethods]);

  const startDate = useWatch({ control: formMethods.control, name: 'startDate' });
  const endDate = useWatch({ control: formMethods.control, name: 'endDate' });
  const selectedAstroObjectIds = useWatch({
    control: formMethods.control,
    name: 'selectedAstroObjectIds',
    defaultValue: initialSelectedAstroObjectIds,
  });

  const relationMap = useMemo(() => {
    const map = new Map<string, PhotoEntryAstroRelation>();

    for (const item of (p.entry.astroObjects ?? []) as PhotoEntryAstroRelation[]) {
      const id = getRelationAstroObjectId(item);
      if (!id) continue;
      map.set(id, item);
    }

    return map;
  }, [p.entry.astroObjects]);

  const assignedAstroObjects = useMemo<MatchedAstroObjectItem[]>(() => {
    const ids = new Set(initialSelectedAstroObjectIds);

    return astroObjects
      .filter((astroObject) => ids.has(astroObject.id))
      .map((astroObject) => ({
        ...astroObject,
        relationRootPath: relationMap.get(astroObject.id)?.rootPath ?? null,
      }));
  }, [astroObjects, initialSelectedAstroObjectIds, relationMap]);

  const editableAstroObjects = useMemo<MatchedAstroObjectItem[]>(() => {
    return astroObjects.map((astroObject) => ({
      ...astroObject,
      relationRootPath: relationMap.get(astroObject.id)?.rootPath ?? null,
    }));
  }, [astroObjects, relationMap]);

  const astroObjectsToRender = isLocked ? assignedAstroObjects : editableAstroObjects;

  const canCreateFolders = useMemo(() => {
    if (p.entry.foldersCreated) return false;
    if (!startDate || !endDate) return false;
    if (isAstro && (!selectedAstroObjectIds || selectedAstroObjectIds.length === 0)) {
      return false;
    }

    return true;
  }, [p.entry.foldersCreated, isAstro, startDate, endDate, selectedAstroObjectIds]);

  const toggleAstroObject = (astroObjectId: string) => {
    if (isLocked) return;

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
        id: p.entry.id,
        patchPhotoEntryDto: payload,
      });

      await p.onSaved?.();
    } catch (error: any) {
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolders = async () => {
    if (!photoEntryApi || !canCreateFolders) return;

    setFoldersLoading(true);
    setConfirmDelete(false);

    try {
      await photoEntryApi.photoEntryControllerCreateFolders({
        id: p.entry.id,
      });

      await p.onFoldersCreated?.();
    } catch (error: any) {
      console.log(error?.message);
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
      await photoEntryApi.photoEntryControllerDelete({ id: p.entry.id });
      await p.handleClose?.();
    } catch (error: any) {
      console.log(error?.message);
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        {isLocked ? (
          <div style={styles.lockedBanner}>
            <div style={styles.lockedIcon}>
              <FiLock size={14} />
            </div>
            <div style={styles.lockedText}>Folders already created. Editing is locked for this entry.</div>
          </div>
        ) : null}

        <div
          style={{
            ...styles.layout,
            ...(isAstro ? styles.layoutTwoColumns : styles.layoutOneColumn),
          }}
        >
          <div style={styles.leftColumn}>
            {isLocked ? (
              <>
                <ReadOnlyField label='Name' value={p.entry.name} />
                <div style={styles.row}>
                  <ReadOnlyField label='Type' value={p.entry.type} style={styles.flex} />
                  <ReadOnlyField label='Status' value={p.entry.status} style={styles.flex} />
                </div>
                <div style={styles.row}>
                  <ReadOnlyField label='Start Date' value={formatDate(p.entry.startDate)} style={styles.flex} />
                  <ReadOnlyField label='End Date' value={formatDate(p.entry.endDate)} style={styles.flex} />
                </div>
              </>
            ) : (
              <>
                <Input name='name' label='Name' description='Photo entry name' type='text' />

                <div style={styles.row}>
                  <ReadOnlyField label='Type' value={p.entry.type} style={styles.flex} />
                  <ReadOnlyField label='Status' value={p.entry.status} style={styles.flex} />
                </div>

                <div style={styles.row}>
                  <Input
                    name='startDate'
                    style={styles.flex}
                    label='Start Date'
                    description='Entry start date'
                    type='date'
                  />
                  <Input name='endDate' style={styles.flex} label='End Date' description='Entry end date' type='date' />
                </div>
              </>
            )}

            <div style={styles.metaCard}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Root path</span>
                <span style={styles.metaValue}>{p.entry.rootPath || '—'}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Folders</span>
                <span style={styles.metaValue}>{p.entry.foldersCreated ? 'Created' : 'Not created'}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Folders created at</span>
                <span style={styles.metaValue}>{formatDateTime(p.entry.foldersCreatedAt)}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Created at</span>
                <span style={styles.metaValue}>{formatDateTime(p.entry.createdAt)}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Updated at</span>
                <span style={styles.metaValue}>{formatDateTime(p.entry.updatedAt)}</span>
              </div>

              {isAstro ? (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Astro objects</span>
                  <span style={styles.metaValue}>{selectedAstroObjectIds?.length ?? 0}</span>
                </div>
              ) : null}
            </div>
          </div>

          {isAstro ? (
            <div style={styles.rightColumn}>
              <div style={styles.astroSection}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIconWrap}>
                    <FiMoon size={14} />
                  </div>

                  <div style={styles.sectionHeaderText}>
                    <div style={styles.sectionTitle}>Astro objects</div>
                    <div style={styles.sectionDescription}>
                      {isLocked ? 'Assigned astro objects' : 'Select astro objects for this entry'}
                    </div>
                  </div>
                </div>

                <div style={styles.astroScrollWrap}>
                  <Scrollbar style={styles.astroScrollbar}>
                    <div style={styles.astroList}>
                      {astroObjectsToRender.length === 0 ? (
                        <div style={styles.emptyState}>
                          {isLocked ? 'No astro objects assigned' : 'No astro objects available'}
                        </div>
                      ) : (
                        astroObjectsToRender.map((astroObject) => {
                          const checked = (selectedAstroObjectIds ?? []).includes(astroObject.id);

                          return (
                            <button
                              key={astroObject.id}
                              type='button'
                              aria-disabled={isLocked}
                              onClick={() => {
                                if (isLocked) return;
                                toggleAstroObject(astroObject.id);
                              }}
                              style={{
                                ...styles.astroItem,
                                ...(checked ? styles.astroItemActive : {}),
                                cursor: isLocked ? 'default' : 'pointer',
                              }}
                            >
                              {!isLocked ? (
                                <div
                                  style={{
                                    ...styles.checkbox,
                                    ...(checked ? styles.checkboxActive : {}),
                                  }}
                                >
                                  {checked ? <FiCheck size={12} /> : null}
                                </div>
                              ) : null}

                              <div style={styles.astroItemContent}>
                                <div style={styles.astroItemTitle}>
                                  {astroObject.code ? astroObject.code : astroObject.name}
                                </div>

                                <div style={styles.astroItemSubtitle}>{astroObject.name}</div>

                                {astroObject.relationRootPath ? (
                                  <div style={styles.astroItemPath} title={astroObject.relationRootPath}>
                                    {astroObject.relationRootPath}
                                  </div>
                                ) : null}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Scrollbar>
                </div>

                {formMethods.formState.errors.selectedAstroObjectIds ? (
                  <div style={styles.errorText}>{formMethods.formState.errors.selectedAstroObjectIds.message}</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div style={styles.actionsRow}>
          {!isLocked ? (
            <div style={styles.leftActions}>
              <Button
                label={confirmDelete ? 'Confirm' : 'Delete'}
                onClick={handleDelete}
                loading={deleteLoading}
                variant={confirmDelete ? 'danger' : 'secondary'}
              />
            </div>
          ) : (
            <div />
          )}

          <div style={styles.rightActions}>
            {!isLocked ? (
              <Button label='Save changes' onClick={formMethods.handleSubmit(handleSave)} loading={loading} />
            ) : null}

            {!p.entry.foldersCreated ? (
              <Button
                label='Create folders'
                onClick={handleCreateFolders}
                loading={foldersLoading}
                disabled={!canCreateFolders}
                icon={<FiFolder size={14} />}
              />
            ) : null}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

const ReadOnlyField = ({
  label,
  value,
  style,
}: {
  label: string;
  value?: string | null;
  style?: Record<string, any>;
}) => {
  const styles = useStyles();

  return (
    <div style={{ ...styles.readOnlyField, ...style }}>
      <div style={styles.readOnlyLabel}>{label}</div>
      <div style={styles.readOnlyValue}>{value || '—'}</div>
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

const formatDateTime = (value?: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString();
};

const useStyles = mkUseStyles((t) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.m,
    width: '100%',
    minWidth: 400,
    minHeight: 0,
  },
  layout: {
    display: 'grid',
    gap: t.spacing.l,
    width: '100%',
    alignItems: 'stretch',
  },
  layoutTwoColumns: {
    gridTemplateColumns: 'minmax(0, 1fr) 360px',
  },
  layoutOneColumn: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  leftColumn: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.m,
  },
  rightColumn: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    minHeight: 0,
    height: '100%',
  },
  row: {
    display: 'flex',
    gap: t.spacing.m,
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  lockedBanner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 179, 72, 0.08)',
    border: '1px solid rgba(232, 179, 72, 0.18)',
  },
  lockedIcon: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 179, 72, 0.14)',
    color: '#E8B348',
    flexShrink: 0,
  },
  lockedText: {
    fontSize: 13,
    opacity: 0.92,
  },
  readOnlyField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${t.colors.gray01}`,
    backgroundColor: 'rgba(255,255,255,0.02)',
    minWidth: 0,
  },
  readOnlyLabel: {
    fontSize: 12,
    opacity: 0.68,
  },
  readOnlyValue: {
    fontSize: 14,
    fontWeight: 500,
    wordBreak: 'break-word',
  },
  metaCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: t.spacing.m,
    borderRadius: 12,
    border: `1px solid ${t.colors.gray01}`,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    alignItems: 'flex-start',
  },
  metaLabel: {
    opacity: 0.68,
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  astroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
    border: '1px solid rgba(168, 85, 247, 0.18)',
    color: '#D1B3FF',
    flexShrink: 0,
  },
  sectionHeaderText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionDescription: {
    opacity: 0.7,
    fontSize: 13,
  },
  astroScrollWrap: {
    flex: 1,
    minHeight: 0,
  },
  astroScrollbar: {
    height: '100%',
  },
  astroList: {
    display: 'flex',
    marginRight: t.spacing.l,
    flexDirection: 'column',
    gap: t.spacing.s,
    minWidth: 0,
  },
  astroItem: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    display: 'flex',
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'flex-start',
    textAlign: 'left',
    appearance: 'none',
    WebkitAppearance: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    textDecoration: 'none',
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: 'none',
  },
  astroItemActive: {
    border: '1px solid rgba(168, 85, 247, 0.28)',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
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
    backgroundColor: 'transparent',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxActive: {
    border: '1px solid rgba(168, 85, 247, 0.32)',
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    color: '#DCC2FF',
  },
  astroItemContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    userSelect: 'text',
    WebkitUserSelect: 'text',
  },
  astroItemTitle: {
    fontWeight: '500',
  },
  astroItemSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  astroItemPath: {
    fontSize: 11,
    opacity: 0.6,
    wordBreak: 'break-word',
    marginTop: 2,
    userSelect: 'text',
    WebkitUserSelect: 'text',
  },
  emptyState: {
    opacity: 0.7,
    fontSize: 13,
  },
  errorText: {
    color: t.colors.red,
    fontSize: 12,
  },
  actionsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: t.spacing.m,
    gap: t.spacing.s,
  },
  leftActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'center',
  },
  rightActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'center',
  },
}));
