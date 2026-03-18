import { ChangeEvent, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineCamera, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { AstroObjectResponse, PhotoEntryStatus, PhotoEntryType } from '~/api/api';
import { Button } from '~/components/Button';
import { Select } from '~/components/Select';
import { mkUseStyles } from '~/utils/theme';
import { colors } from '~/utils/theme/colors';
import { IoMdClose } from 'react-icons/io';

type PhotoLibraryToolbarProps = {
  search: string;
  status?: PhotoEntryStatus;
  type?: PhotoEntryType;
  astroObjectId?: string;
  astroObjects: AstroObjectResponse[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: PhotoEntryStatus) => void;
  onTypeChange: (value?: PhotoEntryType) => void;
  onAstroObjectChange: (value?: string) => void;
  onResetFilters: () => void;
  onAddEntry: () => void;
};

type ToolbarFormValues = {
  status: string;
  type: string;
  astroObjectId: string;
};

const getStatusLabel = (status: PhotoEntryStatus) => {
  switch (status) {
    case PhotoEntryStatus.Planned:
      return 'Planned';
    case PhotoEntryStatus.Active:
      return 'Active';
    case PhotoEntryStatus.Imported:
      return 'Imported';
    case PhotoEntryStatus.Selected:
      return 'Selected';
    case PhotoEntryStatus.Editing:
      return 'Editing';
    case PhotoEntryStatus.Completed:
      return 'Completed';
    default:
      return status;
  }
};

const getTypeLabel = (type: PhotoEntryType) => type;

export const PhotoLibraryToolbar = ({
  search,
  status,
  type,
  astroObjectId,
  astroObjects,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onAstroObjectChange,
  onResetFilters,
  onAddEntry,
}: PhotoLibraryToolbarProps) => {
  const styles = useStyles();

  const statusOptions = useMemo(
    () => [
      { label: 'All statuses', value: '' },
      ...Object.values(PhotoEntryStatus).map((item) => ({
        label: getStatusLabel(item),
        value: item,
      })),
    ],
    [],
  );

  const typeOptions = useMemo(
    () => [
      { label: 'All types', value: '' },
      ...Object.values(PhotoEntryType).map((item) => ({
        label: getTypeLabel(item),
        value: item,
      })),
    ],
    [],
  );

  const astroOptions = useMemo(
    () => [
      { label: 'All astro objects', value: '' },
      ...astroObjects.map((item) => ({
        label: item.code ? `${item.code} · ${item.name}` : item.name,
        value: item.id,
      })),
    ],
    [astroObjects],
  );

  const { control, setValue } = useForm<ToolbarFormValues>({
    defaultValues: {
      status: status || '',
      type: type || '',
      astroObjectId: astroObjectId || '',
    },
  });

  useEffect(() => {
    setValue('status', status || '');
  }, [status, setValue]);

  useEffect(() => {
    setValue('type', type || '');
  }, [type, setValue]);

  useEffect(() => {
    setValue('astroObjectId', astroObjectId || '');
  }, [astroObjectId, setValue]);

  const hasActiveFilters = Boolean(search.trim() || status || type || astroObjectId);

  const handleResetFilters = () => {
    setValue('status', '');
    setValue('type', '');
    setValue('astroObjectId', '');
    onResetFilters();
  };

  return (
    <div style={styles.container}>
      <div style={styles.filters}>
        <div style={styles.searchWrap}>
          <div style={styles.searchBox}>
            <div style={styles.searchIcon}>
              <HiOutlineMagnifyingGlass size={18} />
            </div>

            <input
              value={search}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
              placeholder='Search sessions...'
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.selectWrap}>
          <Select<ToolbarFormValues>
            name='status'
            label='Status'
            control={control}
            variant='secondary'
            options={statusOptions}
            style={styles.select}
            onValueChange={(value) => onStatusChange(value ? (value as PhotoEntryStatus) : undefined)}
          />
        </div>

        <div style={styles.selectWrap}>
          <Select<ToolbarFormValues>
            name='type'
            label='Type'
            control={control}
            variant='secondary'
            options={typeOptions}
            style={styles.select}
            onValueChange={(value) => onTypeChange(value ? (value as PhotoEntryType) : undefined)}
          />
        </div>

        <div style={styles.selectWideWrap}>
          <Select<ToolbarFormValues>
            name='astroObjectId'
            label='Astro Object'
            control={control}
            variant='secondary'
            options={astroOptions}
            style={styles.selectWide}
            onValueChange={(value) => onAstroObjectChange(value || undefined)}
          />
        </div>

        <AnimatePresence>
          {hasActiveFilters ? (
            <motion.div
              role='button'
              tabIndex={0}
              onClick={handleResetFilters}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleResetFilters();
                }
              }}
              style={styles.resetButton}
              initial={{ opacity: 0, scale: 0.92, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <IoMdClose size={24} color={colors.red} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div style={styles.actions}>
        <Button
          variant='secondary'
          label='New Session'
          icon={<HiOutlineCamera color={colors.lightGreen} size={18} />}
          onClick={onAddEntry}
        />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 16,
    minWidth: 1100,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    background: colors.gray04 + t.colorOpacity(0.7),
  },
  filters: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    flex: 1,
    flexWrap: 'nowrap',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  searchWrap: {
    width: 260,
    minWidth: 260,
    flexShrink: 0,
  },
  searchBox: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: '0 14px',
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    boxShadow: `inset 0 0 0 1px ${colors.blue03 + t.colorOpacity(0.06)}`,
  },
  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.blue04,
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    color: colors.white,
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: 14,
    padding: 0,
  },
  selectWrap: {
    width: 170,
    minWidth: 170,
    flexShrink: 0,
  },
  selectWideWrap: {
    width: 220,
    minWidth: 220,
    marginRight: 40,
    flexShrink: 0,
  },
  select: {
    width: '100%',
  },
  selectWide: {
    width: 'calc(100% + 40px)',
  },
  resetButton: {
    padding: '0 14px',
    height: 50,
    borderRadius: t.borderRadius.default,
    background: colors.red + t.colorOpacity(0.2),
    color: colors.white,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
    userSelect: 'none' as const,
  },
}));
