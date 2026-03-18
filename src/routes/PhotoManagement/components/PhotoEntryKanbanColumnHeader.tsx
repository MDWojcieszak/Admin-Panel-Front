import { motion } from 'framer-motion';
import { CSSProperties } from 'react';

type PhotoEntryKanbanColumnHeaderProps = {
  title: string;
  count: number;
  accentColor: string;
  shouldHighlight: boolean;
  styles: Record<string, CSSProperties>;
};

export const PhotoEntryKanbanColumnHeader = ({
  title,
  count,
  accentColor,
  shouldHighlight,
  styles,
}: PhotoEntryKanbanColumnHeaderProps) => {
  return (
    <div style={styles.columnHeader}>
      <motion.div
        animate={{
          opacity: shouldHighlight ? 1 : 0.85,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          ...styles.columnAccent,
          backgroundColor: accentColor,
        }}
      />
      <div style={styles.columnTitle}>{title}</div>
      <div style={styles.columnCount}>{count}</div>
    </div>
  );
};
