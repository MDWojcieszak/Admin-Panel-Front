import { CSSProperties, KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { FaChevronDown } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';
import { mkUseStyles, useTheme } from '~/utils/theme';

export type SearchSelectOption = {
  value: string;
  label: string;
  /** Shown beside the option and the chosen value. */
  icon?: IconType;
  /** Options sharing a group are listed under its heading, in the order given. */
  group?: string;
  /** Extra words the search matches: synonyms, another language, part numbers. */
  keywords?: string;
  /** Muted, at the row's right edge: a code or count that tells similar options apart. */
  hint?: string;
};

type SearchSelectProps = {
  value: string;
  options: SearchSelectOption[];
  onChange: (value: string) => void;
  /** The floating label; without it (`bare`) the field is the compact row variant. */
  label?: string;
  bare?: boolean;
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
};

const ICON_SIZE = 18;
const LIST_HEIGHT = 320;

/** Case- and accent-blind, so "srub" finds "Śruba" and "e" finds "é". */
const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');

/**
 * A select for long lists: typing narrows the options (label, group and
 * keywords, every word must match), arrows and Enter pick one, Escape closes.
 * Looks like the panel's Select; the list opens in a portal and flips above
 * the field when there is no room below.
 */
export const SearchSelect = (p: SearchSelectProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const fieldRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [coords, setCoords] = useState<{ left: number; width: number; top?: number; bottom?: number }>();
  const labelled = !!p.label && !p.bare;

  const selected = p.options.find((o) => o.value === p.value);
  const SelectedIcon = selected?.icon;

  const matches = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (!words.length) return p.options;
    return p.options.filter((o) => {
      const haystack = fold(`${o.label} ${o.group ?? ''} ${o.keywords ?? ''}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [p.options, query]);

  const place = () => {
    const r = fieldRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    const up = below < LIST_HEIGHT + 60 && r.top > below;
    setCoords({
      left: r.left,
      width: Math.max(r.width, 280),
      ...(up ? { bottom: window.innerHeight - r.top + theme.spacing.s } : { top: r.bottom + theme.spacing.s }),
    });
  };

  const show = () => {
    if (p.disabled) return;
    place();
    setQuery('');
    setActive(
      Math.max(
        0,
        p.options.findIndex((o) => o.value === p.value),
      ),
    );
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    fieldRef.current?.focus();
  };

  const pick = (option?: SearchSelectOption) => {
    if (!option) return;
    if (option.value !== p.value) p.onChange(option.value);
    close();
  };

  // Closes on a click elsewhere, on a page scroll (not the list's own) and on resize.
  useLayoutEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (listRef.current?.contains(target) || fieldRef.current?.contains(target)) return;
      setOpen(false);
    };
    const scroll = (e: Event) => {
      if (listRef.current && e.target instanceof Node && listRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener('mousedown', outside);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('mousedown', outside);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', resize);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keeps the highlighted option in view while arrowing through the list.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(matches[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  let lastGroup: string | undefined;

  return (
    <div style={{ ...styles.container, ...(p.disabled ? { opacity: 0.6 } : null), ...p.style }}>
      {labelled ? <span style={styles.label}>{p.label}</span> : null}
      <button
        ref={fieldRef}
        type='button'
        disabled={p.disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label={p.label}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            show();
          }
        }}
        style={{
          ...styles.field,
          paddingTop: labelled ? theme.spacing.l + 4 : theme.spacing.m,
          cursor: p.disabled ? 'default' : 'pointer',
        }}
      >
        {SelectedIcon ? <SelectedIcon size={ICON_SIZE} color={theme.colors.blue04} style={styles.fieldIcon} /> : null}
        <span style={{ ...styles.value, color: selected ? theme.colors.white : theme.colors.dark05 }}>
          {selected?.label ?? p.placeholder ?? 'Choose…'}
        </span>
        <motion.span style={styles.chevron} animate={{ rotate: open ? '180deg' : 0 }} transition={{ duration: 0.15 }}>
          <FaChevronDown size={labelled ? 20 : 18} fill={theme.colors.blue} />
        </motion.span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && coords ? (
            <motion.div
              ref={listRef}
              role='listbox'
              initial={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -8 }}
              style={{
                ...styles.popover,
                left: coords.left,
                top: coords.top,
                bottom: coords.bottom,
                width: coords.width,
              }}
            >
              <div style={styles.search}>
                <FiSearch size={15} color={theme.colors.dark05} />
                <input
                  ref={searchRef}
                  value={query}
                  placeholder='Search…'
                  aria-label='Search'
                  style={styles.searchInput}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKey}
                />
              </div>
              <div style={styles.options}>
                {matches.length === 0 ? <span style={styles.empty}>Nothing matches.</span> : null}
                {matches.map((option, index) => {
                  const heading = option.group && option.group !== lastGroup ? option.group : null;
                  lastGroup = option.group;
                  const Icon = option.icon;
                  const isActive = index === active;
                  const isSelected = option.value === p.value;
                  return (
                    <div key={option.value}>
                      {heading ? <span style={styles.group}>{heading}</span> : null}
                      <div
                        role='option'
                        aria-selected={isSelected}
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(option)}
                        style={{
                          ...styles.option,
                          backgroundColor: isActive ? theme.colors.blue : 'transparent',
                          fontWeight: isSelected ? 700 : 400,
                        }}
                      >
                        {Icon ? (
                          <Icon size={ICON_SIZE} color={isActive ? theme.colors.white : theme.colors.blue04} />
                        ) : null}
                        <span style={styles.optionLabel}>{option.label}</span>
                        {option.hint ? (
                          <span
                            style={{ ...styles.optionHint, color: isActive ? theme.colors.white : theme.colors.dark05 }}
                          >
                            {option.hint}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { position: 'relative', minWidth: 0 },
  label: {
    position: 'absolute',
    left: t.spacing.m,
    top: 6,
    fontSize: 12,
    color: t.colors.blue04,
    pointerEvents: 'none',
    zIndex: 1,
  },
  field: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    width: '100%',
    padding: t.spacing.m,
    paddingRight: t.spacing.m + 20 + t.spacing.s,
    border: 0,
    borderRadius: t.borderRadius.default,
    outline: 'none',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    fontSize: 16,
    fontFamily: 'inherit',
    textAlign: 'left',
    boxSizing: 'border-box',
    position: 'relative',
  },
  fieldIcon: { flexShrink: 0 },
  value: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chevron: {
    position: 'absolute',
    right: t.spacing.m,
    top: '50%',
    marginTop: -10,
    display: 'flex',
    pointerEvents: 'none',
  },
  popover: {
    position: 'fixed',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.s,
    padding: t.spacing.s,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    maxWidth: 'calc(100vw - 16px)',
  },
  search: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: `0 ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 15,
    fontFamily: 'inherit',
  },
  options: { maxHeight: LIST_HEIGHT, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 },
  group: {
    display: 'block',
    padding: `${t.spacing.s}px ${t.spacing.s}px ${t.spacing.xxs}px`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.white,
    fontSize: 14,
  },
  optionLabel: { minWidth: 0 },
  optionHint: { marginLeft: 'auto', flexShrink: 0, fontSize: 12, fontWeight: 600, letterSpacing: 0.4 },
  empty: { padding: t.spacing.s, fontSize: 13, color: t.colors.dark05 },
}));
