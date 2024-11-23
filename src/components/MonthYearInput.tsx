import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import { MonthYearSelector } from '~/components/Calendar/MonthYearSelector';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
type MonthYearInputProps<T extends FieldValues> = { label: string; description?: string } & UseControllerProps<T>;

export const MonthYearInput = <T extends FieldValues>(p: MonthYearInputProps<T>) => {
  const [showDescription, setShowDescription] = useState(false);
  const styles = useStyles();
  const theme = useTheme();
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });

  const handleSetDate = (date: Date) => {
    field.onChange(date);
  };

  const renderDescription = errors[p.name] ? <>{errors[p.name]?.message}</> : p.description;

  return (
    <motion.div
      style={styles.inputContainer}
      onHoverStart={() => setShowDescription(true)}
      onHoverEnd={() => setShowDescription(false)}
    >
      <MonthYearSelector setDate={handleSetDate} defaultDate={p.defaultValue} />
      <input style={styles.input} {...field} />
      <AnimatePresence mode='wait'>
        {(showDescription || errors[p.name]) && (
          <motion.p
            initial={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0, color: errors[p.name] ? theme.colors.red : theme.colors.blue04 }}
            exit={{ opacity: 0, translateY: -5 }}
            style={styles.description}
          >
            {renderDescription}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  inputContainer: {
    marginBottom: t.spacing.l,
    position: 'relative',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    padding: t.spacing.s,
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    left: t.spacing.m,
    color: t.colors.blue04,
    pointerEvents: 'none',
  },
  input: {
    display: 'none',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    top: 60,
    fontSize: '12px',
    margin: 0,
    opacity: 0,
  },
  error: {
    fontSize: '14px',
    color: t.colors.red,
    marginTop: '8px',
  },
}));
