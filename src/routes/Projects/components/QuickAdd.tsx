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

/** One line to add a task; Enter adds it and keeps the field for the next one. */
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
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
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
  input: { paddingLeft: 34 },
}));
