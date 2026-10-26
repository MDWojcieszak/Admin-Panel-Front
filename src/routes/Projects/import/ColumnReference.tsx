import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import {
  ChoiceValue,
  COLUMN_TYPE_FORMAT,
  COLUMN_TYPE_LABEL,
  ImportColumn,
  otherNames,
} from '~/routes/Projects/import/schema';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Lists longer than this start folded, with a way to unfold them. */
const FOLD_AFTER = 24;

/**
 * Every column of an import, spelled out: its type and how to write it, what
 * an empty cell means, and — for a closed list — every allowed value with its
 * synonyms, grouped the way the project groups them.
 */
export const ColumnReference = ({ columns }: { columns: ImportColumn[] }) => {
  const styles = useStyles();
  return (
    <div style={styles.list}>
      {columns.map((column) => (
        <ColumnCard key={column.key} column={column} />
      ))}
    </div>
  );
};

const ColumnCard = ({ column }: { column: ImportColumn }) => {
  const styles = useStyles();
  const theme = useTheme();
  const values = column.values ?? [];
  const [open, setOpen] = useState(values.length <= FOLD_AFTER);
  const groups = [...new Set(values.map((v) => v.group).filter(Boolean))] as string[];

  return (
    <div style={styles.card}>
      <div style={styles.head}>
        <span style={styles.name}>{column.label}</span>
        <span style={styles.type}>{COLUMN_TYPE_LABEL[column.type]}</span>
        {column.required ? (
          <span
            style={{ ...styles.type, color: theme.colors.red, borderColor: theme.colors.red + theme.colorOpacity(0.4) }}
          >
            Required
          </span>
        ) : null}
      </div>
      <span style={styles.description}>{column.description}.</span>
      <div style={styles.facts}>
        <span>
          <span style={styles.factLabel}>Format </span>
          {COLUMN_TYPE_FORMAT[column.type]}
        </span>
        {column.empty ? (
          <span>
            <span style={styles.factLabel}>Empty </span>
            {column.empty}
          </span>
        ) : null}
      </div>

      {values.length ? (
        <>
          <button type='button' style={styles.toggle} onClick={() => setOpen((o) => !o)}>
            <FiChevronDown
              size={14}
              style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}
            />
            {values.length} allowed {values.length === 1 ? 'value' : 'values'}
            {open ? '' : ' — show'}
          </button>
          {open ? (
            groups.length ? (
              <div style={styles.groups}>
                {groups.map((group) => (
                  <div key={group} style={styles.group}>
                    <span style={styles.groupTitle}>{group}</span>
                    <Values values={values.filter((v) => v.group === group)} />
                  </div>
                ))}
              </div>
            ) : (
              <Values values={values} />
            )
          ) : null}
        </>
      ) : null}
    </div>
  );
};

const Values = ({ values }: { values: ChoiceValue[] }) => {
  const styles = useStyles();
  return (
    <div style={styles.values}>
      {values.map((v) => (
        <span key={v.value} style={styles.value}>
          <span style={styles.valueName}>{v.value}</span>
          {v.hint ? <span style={styles.hint}>{v.hint}</span> : null}
          {otherNames(v).length ? <span style={styles.aliases}>also {otherNames(v).join(', ')}</span> : null}
        </span>
      ))}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  list: { gap: t.spacing.s },
  card: {
    gap: t.spacing.xs,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
  head: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.spacing.s },
  name: { fontSize: 14, fontWeight: 700, color: t.colors.white },
  type: {
    padding: '1px 8px',
    borderRadius: 999,
    border: `1px solid ${t.colors.blue04 + t.colorOpacity(0.35)}`,
    fontSize: 11,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  description: { fontSize: 13, color: t.colors.white },
  facts: { gap: 2, fontSize: 12, color: t.colors.dark05 },
  factLabel: { fontWeight: 700, color: t.colors.blue04 },
  toggle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    padding: '4px 0',
    border: 'none',
    background: 'transparent',
    color: t.colors.blue,
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  groups: { gap: t.spacing.sm },
  group: { gap: t.spacing.xs },
  groupTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  values: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  value: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    padding: '5px 10px',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    maxWidth: '100%',
  },
  valueName: { fontSize: 13, fontWeight: 600, color: t.colors.white },
  hint: { fontSize: 11, color: t.colors.blue04 },
  aliases: { fontSize: 11, color: t.colors.dark05 },
}));
