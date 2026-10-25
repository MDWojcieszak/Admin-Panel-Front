import { AnimatePresence, motion } from 'framer-motion';
import { CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconType } from 'react-icons';
import { FaChevronDown } from 'react-icons/fa';
import { FiSearch, FiX } from 'react-icons/fi';
import { TbAperture, TbBox, TbBucketDroplet, TbCpu, TbDots, TbEngine, TbNut, TbStack2, TbTool } from 'react-icons/tb';
import { BomPartKind } from '~/api/api';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { BOM_GROUPS, BOM_KIND_ICON, BOM_KIND_KEYWORDS, BOM_KINDS, BomGroup } from '~/routes/Projects/bomKinds';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** One icon per group, shared by the picker and the parts list's group headers. */
export const BOM_GROUP_ICON: Record<BomGroup, IconType> = {
  Fasteners: TbNut,
  Mechanical: TbBox,
  Motion: TbEngine,
  Electronics: TbCpu,
  'Optics & photo': TbAperture,
  Materials: TbStack2,
  Consumables: TbBucketDroplet,
  'Tools & services': TbTool,
  Other: TbDots,
};

const KINDS = Object.entries(BOM_KINDS) as [BomPartKind, (typeof BOM_KINDS)[BomPartKind]][];

/** Lower case without diacritics, so "lozysko" finds "łożysko". */
const fold = (text: string) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/** What a search matches per kind: its label, its group and the Polish words for it. */
const SEARCH_TEXT = Object.fromEntries(
  KINDS.map(([value, kind]) => [value, fold(`${kind.label} ${kind.group} ${BOM_KIND_KEYWORDS[value] ?? ''}`)]),
) as Record<BomPartKind, string>;

const POPOVER_WIDTH = 600;

type KindPickerProps = {
  value: BomPartKind;
  onChange: (kind: BomPartKind) => void;
  /** A floating label, as on the panel's fields; without it the compact variant for a row. */
  label?: string;
  disabled?: boolean;
  style?: CSSProperties;
};

/**
 * Which kind of part this is. Ninety-odd kinds do not fit a dropdown, so the
 * field opens a panel with every group laid out at once — the kinds as chips
 * under their group — and a search that narrows them as you type; Enter takes
 * the first match. On a phone the panel comes up from the bottom.
 */
export const KindPicker = ({ value, onChange, label, disabled, style }: KindPickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const fieldRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ left: number; top?: number; bottom?: number; maxHeight: number }>();

  const current = BOM_KINDS[value] ?? BOM_KINDS[BomPartKind.Other];
  // The kind's own icon where it has one, else its group's.
  const CurrentIcon = BOM_KIND_ICON[value] ?? BOM_GROUP_ICON[current.group];

  const groups = useMemo(() => {
    const term = fold(query.trim());
    return BOM_GROUPS.map((group) => ({
      group,
      kinds: KINDS.filter(([value, kind]) => kind.group === group && (!term || SEARCH_TEXT[value].includes(term))),
    })).filter((g) => g.kinds.length);
  }, [query]);

  const place = () => {
    const el = fieldRef.current;
    if (!el || isMobile) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 16;
    const above = r.top - 16;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POPOVER_WIDTH - 8));
    // Down when it fits, otherwise whichever side has more room.
    if (below >= 360 || below >= above) setCoords({ left, top: r.bottom + 8, maxHeight: below });
    else setCoords({ left, bottom: window.innerHeight - r.top + 8, maxHeight: above });
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (kind: BomPartKind) => {
    close();
    if (kind !== value) onChange(kind);
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || fieldRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onResize = () => place();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile]);

  const panel = (
    <motion.div
      ref={panelRef}
      initial={isMobile ? { y: '100%' } : { opacity: 0, y: -6 }}
      animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
      exit={isMobile ? { y: '100%' } : { opacity: 0, y: -6 }}
      transition={isMobile ? { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.28 } : { duration: 0.14 }}
      style={
        isMobile
          ? styles.sheet
          : {
              ...styles.popover,
              left: coords?.left,
              top: coords?.top,
              bottom: coords?.bottom,
              maxHeight: coords?.maxHeight,
            }
      }
    >
      <label style={styles.search}>
        <FiSearch size={16} color={theme.colors.dark05} />
        <input
          autoFocus={!isMobile}
          value={query}
          placeholder='Search: screw, bearing, śruba, łożysko…'
          style={styles.searchInput}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && groups[0]) {
              e.preventDefault();
              pick(groups[0].kinds[0][0]);
            }
          }}
        />
        {query ? (
          <button type='button' aria-label='Clear search' style={styles.clear} onClick={() => setQuery('')}>
            <FiX size={14} />
          </button>
        ) : null}
      </label>

      <div style={styles.groups}>
        {groups.length === 0 ? (
          <span style={styles.empty}>Nothing matches — try another word, or pick Other.</span>
        ) : null}
        {groups.map(({ group, kinds }) => {
          const Icon = BOM_GROUP_ICON[group];
          return (
            <div key={group} style={styles.group}>
              <span style={styles.groupTitle}>
                <Icon size={15} color={theme.colors.blue04} />
                {group}
              </span>
              <div style={styles.chips}>
                {kinds.map(([kind, info]) => {
                  const active = kind === value;
                  const KindIcon = BOM_KIND_ICON[kind];
                  return (
                    <button
                      key={kind}
                      type='button'
                      onClick={() => pick(kind)}
                      style={{ ...styles.chip, ...(active ? styles.chipActive : null) }}
                    >
                      {KindIcon ? <KindIcon size={14} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} /> : null}
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <>
      <button
        ref={fieldRef}
        type='button'
        disabled={disabled}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-label={label ?? 'Kind'}
        onClick={() => (open ? close() : setOpen(true))}
        style={{
          ...styles.field,
          ...(label ? styles.fieldLabelled : null),
          ...(open ? styles.fieldOpen : null),
          ...(disabled ? { opacity: 0.6, cursor: 'default' } : null),
          ...style,
        }}
      >
        {label ? <span style={styles.label}>{label}</span> : null}
        <span style={styles.value}>
          <CurrentIcon size={18} color={theme.colors.blue04} style={{ flexShrink: 0 }} />
          <span style={styles.valueText}>{current.label}</span>
        </span>
        <FaChevronDown
          size={label ? 20 : 18}
          fill={theme.colors.blue}
          style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open ? (
            isMobile ? (
              <div key='sheet' style={styles.layer}>
                <motion.div
                  style={styles.mask}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={close}
                />
                {panel}
              </div>
            ) : coords ? (
              <div key='popover'>{panel}</div>
            ) : null
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  // Sized like the panel's Select: compact 52px, labelled 60px.
  field: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
    minWidth: 0,
    height: 52,
    padding: `0 ${t.spacing.m + 20 + t.spacing.s}px 0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    border: 0,
    borderRadius: t.borderRadius.default,
    outline: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    color: t.colors.white,
    font: 'inherit',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  fieldLabelled: { height: 60 },
  fieldOpen: { boxShadow: `inset 0 0 0 1px ${t.colors.blue}` },
  label: { fontSize: 12, color: t.colors.blue04, lineHeight: 1.2 },
  value: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, minWidth: 0 },
  valueText: { fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 },
  chevron: { position: 'absolute', right: t.spacing.m, top: '50%', marginTop: -10, transition: 'transform 0.15s ease' },
  popover: {
    position: 'fixed',
    zIndex: 1000,
    width: `min(${POPOVER_WIDTH}px, calc(100vw - 16px))`,
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.sm,
    padding: t.spacing.sm,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  },
  layer: { position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' },
  mask: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.sm,
    maxHeight: '80dvh',
    padding: t.spacing.m,
    paddingBottom: `calc(${t.spacing.m}px + env(safe-area-inset-bottom, 0px))`,
    boxSizing: 'border-box',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: t.colors.gray045,
    borderTop: `1px solid ${t.colors.blue02 + t.colorOpacity(0.3)}`,
  },
  search: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexShrink: 0,
    height: 44,
    padding: `0 ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    cursor: 'text',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    font: 'inherit',
    // 16px keeps iOS from zooming the page in on focus.
    fontSize: 16,
  },
  clear: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
  },
  groups: { gap: t.spacing.m, overflowY: 'auto', minHeight: 0, paddingRight: 2 },
  group: { gap: t.spacing.xs, flexShrink: 0 },
  groupTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    padding: '0 12px',
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.dark04 + t.colorOpacity(0.5),
    background: 'transparent',
    color: t.colors.white,
    font: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  chipActive: { borderColor: t.colors.blue, backgroundColor: t.colors.blue + t.colorOpacity(0.22), fontWeight: 700 },
  empty: { fontSize: 13, color: t.colors.dark05, padding: `${t.spacing.s}px 0` },
}));
