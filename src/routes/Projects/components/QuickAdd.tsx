import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { CreateTaskDto } from '~/api/api';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { mkUseStyles, useTheme } from '~/utils/theme';

const UNITS = 'kg|dag|g|l|ml|szt|pcs|pc|x|m|cm|mm|op|pack|packs|bottle|bottles';
/** "2 kg flour", "3x eggs", "1.5 l milk": a leading amount becomes the quantity. */
const AMOUNT = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${UNITS})?\\.?\\s+(.+)$`, 'i');

export const parseQuickTask = (text: string, withQuantity: boolean): CreateTaskDto => {
  const title = text.trim();
  if (!withQuantity) return { title };
  const match = AMOUNT.exec(title);
  if (!match) return { title };
  const unit = match[2]?.toLowerCase();
  return {
    title: match[3].trim(),
    quantity: Number(match[1].replace(',', '.')),
    unit: unit && unit !== 'x' ? unit : null,
  };
};

/** List markers a pasted line may start with: "- ", "* ", "• ", "1. ", "[ ] ", "☐ ". */
const MARKER = /^\s*(?:[-*•▪◦☐]|\[\s?[xX]?\]|\d+[.)])\s+/;

/** Lines pasted from a note, a message or a spreadsheet column, one task each. */
export const splitPastedTasks = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(MARKER, '').split('\t')[0].trim())
    .filter(Boolean);

/**
 * One line to add a task; Enter adds it and keeps the field for the next one.
 * Pasting several lines adds each as a task — a shopping list from a note.
 */
export const QuickAdd = ({
  placeholder,
  withQuantity,
  onAdd,
  autoFocus,
}: {
  placeholder: string;
  /** Lists read a leading amount ("2 kg flour") as quantity and unit. */
  withQuantity?: boolean;
  onAdd: (dto: CreateTaskDto) => Promise<unknown>;
  autoFocus?: boolean;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [pasting, setPasting] = useState<{ done: number; total: number }>();

  const addMany = async (lines: string[]) => {
    setBusy(true);
    setPasting({ done: 0, total: lines.length });
    try {
      for (let i = 0; i < lines.length; i++) {
        await onAdd(parseQuickTask(lines[i], !!withQuantity));
        setPasting({ done: i + 1, total: lines.length });
      }
    } finally {
      setBusy(false);
      setPasting(undefined);
    }
  };

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(parseQuickTask(text, !!withQuantity));
      setText('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <FiPlus size={16} color={theme.colors.dark05} style={styles.icon} />
      <input
        autoFocus={autoFocus}
        style={{ ...shared.textInput, ...styles.input, opacity: busy ? 0.6 : 1 }}
        value={text}
        placeholder={pasting ? `Adding ${pasting.done} of ${pasting.total}…` : placeholder}
        disabled={Boolean(pasting)}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          const lines = splitPastedTasks(e.clipboardData.getData('text'));
          if (lines.length < 2 || busy) return;
          e.preventDefault();
          addMany(lines);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setText('');
        }}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: { position: 'relative', flexShrink: 0 },
  icon: { position: 'absolute', left: t.spacing.sm, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  // Clear of the plus: its inset, its width, then the usual gap.
  input: { paddingLeft: t.spacing.sm + 16 + t.spacing.s },
}));
