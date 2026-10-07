import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { IconType } from 'react-icons';
import {
  FiCalendar,
  FiCamera,
  FiChevronDown,
  FiColumns,
  FiList,
  FiPlus,
  FiSearch,
  FiSlash,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import { TbGalaxy } from 'react-icons/tb';
import { AstroObjectResponse, PhotoEntryPostStage, PhotoEntryStatus, PhotoEntryType } from '~/api/api';
import { Button } from '~/components/Button';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { getPhotoEntryTypeMeta } from '~/routes/PhotoManagement/utils/entryDisplay';
import { mkUseStyles, useTheme } from '~/utils/theme';

export type PhotoLibraryView = 'board' | 'list' | 'calendar';

const VIEW_ITEMS = [
  { label: 'Board', value: 'board', icon: <FiColumns size={14} /> },
  { label: 'List', value: 'list', icon: <FiList size={14} /> },
  { label: 'Calendar', value: 'calendar', icon: <FiCalendar size={14} /> },
];

type ChipOption<T> = { value: T | undefined; label: string; icon?: IconType; color?: string };

const STATUS_OPTIONS: ChipOption<PhotoEntryStatus>[] = [
  { value: undefined, label: 'All' },
  { value: PhotoEntryStatus.Planned, label: 'Planned', icon: FiCalendar },
  { value: PhotoEntryStatus.Shot, label: 'Shot', icon: FiCamera },
  { value: PhotoEntryStatus.Cancelled, label: 'Cancelled', icon: FiSlash },
];

const STAGE_OPTIONS: ChipOption<PhotoEntryPostStage>[] = [
  { value: undefined, label: 'Any' },
  { value: PhotoEntryPostStage.None, label: 'Nothing done' },
  { value: PhotoEntryPostStage.Selecting, label: 'Selecting' },
  { value: PhotoEntryPostStage.Editing, label: 'Editing' },
  { value: PhotoEntryPostStage.Finished, label: 'Finished' },
];

const TYPE_OPTIONS: ChipOption<PhotoEntryType>[] = [
  { value: undefined, label: 'All' },
  ...Object.values(PhotoEntryType).map((type) => {
    const meta = getPhotoEntryTypeMeta(type);
    return { value: type, label: meta.label, icon: meta.icon, color: meta.color };
  }),
];

type PhotoLibraryToolbarProps = {
  view: PhotoLibraryView;
  onViewChange: (view: PhotoLibraryView) => void;
  search: string;
  status?: PhotoEntryStatus;
  postStage?: PhotoEntryPostStage;
  type?: PhotoEntryType;
  astroObjectId?: string;
  astroTargets: AstroObjectResponse[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: PhotoEntryStatus) => void;
  onPostStageChange: (value?: PhotoEntryPostStage) => void;
  onTypeChange: (value?: PhotoEntryType) => void;
  onAstroObjectChange: (value?: string) => void;
  onResetFilters: () => void;
  onAddEntry: () => void;
};

/**
 * Search, view and New Session on top; the filters underneath as rows of chips
 * — every option visible and one click away, instead of four dropdowns that
 * hid what was set. The stage only applies once a session is shot and the
 * target only to astro sessions, so each shows up when it can matter.
 */
export const PhotoLibraryToolbar = (p: PhotoLibraryToolbarProps) => {
  const styles = useStyles();

  const showStage = p.status !== PhotoEntryStatus.Planned && p.status !== PhotoEntryStatus.Cancelled;
  const showTarget = p.type === PhotoEntryType.Astro;
  const hasActiveFilters = Boolean(p.search.trim() || p.status || p.postStage || p.type || p.astroObjectId);
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchBox = (
    <label style={isMobile ? { ...styles.searchBox, ...styles.searchBoxMobile } : styles.searchBox}>
      <FiSearch size={16} />
      <input
        value={p.search}
        onChange={(event: ChangeEvent<HTMLInputElement>) => p.onSearchChange(event.target.value)}
        placeholder='Search sessions…'
        // 16px keeps iOS from zooming the page in when the field takes focus.
        style={isMobile ? { ...styles.searchInput, fontSize: 16 } : styles.searchInput}
      />
      {p.search ? (
        <button type='button' aria-label='Clear search' style={styles.clearSearch} onClick={() => p.onSearchChange('')}>
          <FiX size={14} />
        </button>
      ) : null}
    </label>
  );

  // Phone layout: search, a filter button and New on one line; the chip rows
  // fold away behind the button — on a phone they took the whole screen.
  if (isMobile) {
    const activeCount = [p.status, p.postStage, p.type, p.astroObjectId].filter(Boolean).length;
    return (
      <div style={{ ...styles.container, ...styles.containerMobile }}>
        <div style={styles.mobileRow}>
          {searchBox}
          <button
            type='button'
            aria-label='Filters'
            aria-expanded={filtersOpen}
            style={{ ...styles.iconButton, ...(filtersOpen || activeCount ? styles.iconButtonOn : null) }}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <FiSliders size={18} />
            {activeCount ? <span style={styles.countBadge}>{activeCount}</span> : null}
          </button>
          <button
            type='button'
            aria-label='New session'
            style={{ ...styles.iconButton, ...styles.addButton }}
            onClick={p.onAddEntry}
          >
            <FiPlus size={20} />
          </button>
        </div>

        {filtersOpen ? (
          <div style={styles.mobileFilters}>
            <ChipGroup stacked label='Status' options={STATUS_OPTIONS} value={p.status} onChange={p.onStatusChange} />
            {showStage ? (
              <ChipGroup
                stacked
                label='Stage'
                options={STAGE_OPTIONS}
                value={p.postStage}
                onChange={p.onPostStageChange}
              />
            ) : null}
            <ChipGroup stacked label='Type' options={TYPE_OPTIONS} value={p.type} onChange={p.onTypeChange} />
            {showTarget ? (
              <TargetPicker targets={p.astroTargets} value={p.astroObjectId} onChange={p.onAstroObjectChange} />
            ) : null}
            {hasActiveFilters ? (
              <button type='button' style={{ ...styles.resetButton, marginLeft: 0 }} onClick={p.onResetFilters}>
                <FiX size={14} />
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        <SegmentedTabs
          items={VIEW_ITEMS}
          selected={p.view}
          handleSelect={(value) => p.onViewChange(value as PhotoLibraryView)}
          layoutId='photo-library-view'
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        {searchBox}

        <div style={styles.topActions}>
          <SegmentedTabs
            items={VIEW_ITEMS}
            selected={p.view}
            handleSelect={(value) => p.onViewChange(value as PhotoLibraryView)}
            layoutId='photo-library-view'
          />
          <Button label='New Session' icon={<FiPlus size={16} />} onClick={p.onAddEntry} />
        </div>
      </div>

      <div style={styles.filterRow}>
        <ChipGroup label='Status' options={STATUS_OPTIONS} value={p.status} onChange={p.onStatusChange} />
        {showStage ? (
          <ChipGroup label='Stage' options={STAGE_OPTIONS} value={p.postStage} onChange={p.onPostStageChange} />
        ) : null}
        <ChipGroup label='Type' options={TYPE_OPTIONS} value={p.type} onChange={p.onTypeChange} />
        {showTarget ? (
          <TargetPicker targets={p.astroTargets} value={p.astroObjectId} onChange={p.onAstroObjectChange} />
        ) : null}

        {hasActiveFilters ? (
          <button type='button' style={styles.resetButton} onClick={p.onResetFilters}>
            <FiX size={14} />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
};

const ChipGroup = <T,>({
  label,
  options,
  value,
  onChange,
  stacked,
}: {
  /** Label above and the chips in one swipeable line (the phone's filter panel). */
  stacked?: boolean;
  label: string;
  options: ChipOption<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}) => {
  const styles = useStyles();

  return (
    <div style={stacked ? styles.groupStacked : styles.group}>
      <span style={styles.groupLabel}>{label}</span>
      <div style={stacked ? styles.chipsLine : styles.chips} className={stacked ? 'no-scrollbar' : undefined}>
        {options.map((option) => (
          <Chip
            key={option.label}
            active={option.value === value}
            icon={option.icon}
            iconColor={option.color}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
};

const Chip = ({
  active,
  icon: Icon,
  iconColor,
  onClick,
  children,
}: {
  active: boolean;
  icon?: IconType;
  iconColor?: string;
  onClick: () => void;
  children: ReactNode;
}) => {
  const styles = useStyles();

  return (
    <button
      type='button'
      aria-pressed={active}
      onClick={onClick}
      style={{ ...styles.chip, ...(active ? styles.chipOn : {}) }}
    >
      {Icon ? <Icon size={13} color={active ? undefined : iconColor} /> : null}
      {children}
    </button>
  );
};

/** Astro targets can run to dozens, so they get a searchable menu, not a chip each. */
const TargetPicker = ({
  targets,
  value,
  onChange,
}: {
  targets: AstroObjectResponse[];
  value?: string;
  onChange: (value?: string) => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const selected = targets.find((target) => target.id === value);
  const label = (target: AstroObjectResponse) => (target.code ? `${target.code} · ${target.name}` : target.name);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return targets;
    return targets.filter((target) =>
      [target.code, target.name].filter(Boolean).some((part) => String(part).toLowerCase().includes(term)),
    );
  }, [targets, query]);

  const pick = (id?: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <div style={styles.group}>
      <span style={styles.groupLabel}>Target</span>
      <div ref={ref} style={styles.pickerWrap}>
        <button
          type='button'
          onClick={() => setOpen((prev) => !prev)}
          style={{ ...styles.chip, ...(selected ? styles.chipOn : {}) }}
        >
          <TbGalaxy size={13} color={selected ? undefined : theme.colors.purple02} />
          {selected ? label(selected) : 'All targets'}
          <FiChevronDown size={13} />
        </button>

        {open ? (
          <div style={styles.menu}>
            {targets.length > 6 ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search targets…'
                style={styles.menuSearch}
              />
            ) : null}
            <button type='button' style={styles.menuItem} onClick={() => pick(undefined)}>
              All targets
            </button>
            {visible.map((target) => (
              <button
                key={target.id}
                type='button'
                style={{ ...styles.menuItem, ...(target.id === value ? styles.menuItemOn : {}) }}
                onClick={() => pick(target.id)}
              >
                <TbGalaxy size={13} color={theme.colors.purple02} />
                {label(target)}
              </button>
            ))}
            {visible.length === 0 ? <span style={styles.menuEmpty}>No target matches.</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flex: 1,
    minWidth: 220,
    maxWidth: 420,
    height: 44,
    padding: `0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    cursor: 'text',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    padding: 0,
  },
  clearSearch: {
    display: 'flex',
    border: 'none',
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    padding: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: t.spacing.l,
    rowGap: t.spacing.s,
  },
  containerMobile: { gap: t.spacing.sm, padding: t.spacing.sm },
  mobileRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  searchBoxMobile: { minWidth: 0, maxWidth: 'none' },
  iconButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: t.borderRadius.default,
    border: 'none',
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  iconButtonOn: { color: t.colors.blue, backgroundColor: t.colors.blue + t.colorOpacity(0.16) },
  addButton: { backgroundColor: t.colors.blue },
  countBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: '16px',
    textAlign: 'center',
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
  mobileFilters: { gap: t.spacing.sm },
  groupStacked: { gap: t.spacing.xs, minWidth: 0 },
  chipsLine: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: t.spacing.xs,
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  chip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    // Longhands: the on-state swaps only the colour.
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
  },
  chipOn: {
    color: t.colors.white,
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.18),
  },
  resetButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    marginLeft: 'auto',
    padding: '0 12px',
    border: 'none',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
  },
  pickerWrap: { position: 'relative' },
  menu: {
    position: 'absolute',
    top: 36,
    left: 0,
    zIndex: 30,
    minWidth: 240,
    maxHeight: 320,
    overflowY: 'auto',
    padding: t.spacing.xs,
    gap: 2,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
  },
  menuSearch: {
    height: 34,
    margin: 4,
    padding: '0 10px',
    borderRadius: t.borderRadius.default,
    border: 'none',
    outline: 'none',
    color: t.colors.white,
    fontSize: 13,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    fontSize: 13,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: 'transparent',
  },
  menuItemOn: { backgroundColor: t.colors.blue + t.colorOpacity(0.18) },
  menuEmpty: { padding: '8px 10px', fontSize: 13, color: t.colors.dark05 },
}));
