import { ChangeEvent, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineCamera, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { PhotoEntryPostStage, PhotoEntryStatus, PhotoEntryType } from '~/api/api';
import { Button } from '~/components/Button';
import { Select } from '~/components/Select';
import { mkUseStyles } from '~/utils/theme';
import { colors } from '~/utils/theme/colors';
import { IoMdClose } from 'react-icons/io';

type PhotoLibraryToolbarProps = {
  search: string;
  status?: PhotoEntryStatus;
  postStage?: PhotoEntryPostStage;
  type?: PhotoEntryType;
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: PhotoEntryStatus) => void;
  onPostStageChange: (value?: PhotoEntryPostStage) => void;
  onTypeChange: (value?: PhotoEntryType) => void;
  onResetFilters: () => void;
  onAddEntry: () => void;
};

type ToolbarFormValues = {
  status: string;
  postStage: string;
  type: string;
};

const getStatusLabel = (status: PhotoEntryStatus) => {
  switch (status) {
    case PhotoEntryStatus.Planned:
      return 'Planned';
    case PhotoEntryStatus.Shot:
      return 'Shot';
    case PhotoEntryStatus.Cancelled:
      return 'Cancelled';
    default:
      return status;
  }
};

const getPostStageLabel = (postStage: PhotoEntryPostStage) => {
  switch (postStage) {
    case PhotoEntryPostStage.None:
      return 'Nothing done';
    case PhotoEntryPostStage.Selecting:
      return 'Selecting';
    case PhotoEntryPostStage.Editing:
      return 'Editing';
    case PhotoEntryPostStage.Finished:
      return 'Finished';
    default:
      return postStage;
  }
};

const getTypeLabel = (type: PhotoEntryType) => type;

export const PhotoLibraryToolbar = ({
  search,
  status,
  postStage,
  type,
  onSearchChange,
  onStatusChange,
  onPostStageChange,
  onTypeChange,
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

  // Independent of status on purpose: "what was done with the material" is its own
  // axis, so filtering by it must not imply anything about whether the shoot happened.
  const postStageOptions = useMemo(
    () => [
      { label: 'Any stage', value: '' },
      ...Object.values(PhotoEntryPostStage).map((item) => ({
        label: getPostStageLabel(item),
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

  const { control, setValue } = useForm<ToolbarFormValues>({
    defaultValues: {
      status: status || '',
      postStage: postStage || '',
      type: type || '',
    },
  });

  useEffect(() => {
    setValue('status', status || '');
  }, [status, setValue]);

  useEffect(() => {
    setValue('postStage', postStage || '');
  }, [postStage, setValue]);

  useEffect(() => {
    setValue('type', type || '');
  }, [type, setValue]);

  const hasActiveFilters = Boolean(search.trim() || status || postStage || type);

  const handleResetFilters = () => {
    setValue('status', '');
    setValue('postStage', '');
    setValue('type', '');
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
            name='postStage'
            label='Stage'
            control={control}
            variant='secondary'
            options={postStageOptions}
            style={styles.select}
            onValueChange={(value) => onPostStageChange(value ? (value as PhotoEntryPostStage) : undefined)}
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
    minWidth: 1280,
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
  select: {
    width: '100%',
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
