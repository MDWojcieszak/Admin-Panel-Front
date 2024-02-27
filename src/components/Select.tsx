import { CSSProperties, useState } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa6';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
type Option = {
  label: string;
  value: string;
};

type SelectProps<T extends FieldValues> = {
  label: string;
  options: Option[];
  description?: string;
  style?: CSSProperties;
} & UseControllerProps<T>;

export type SelectRef = {
  value?: Option['value'];
};

export const Select = <T extends FieldValues>(p: SelectProps<T>) => {
  const [selectedOption, setSelectedOption] = useState(p.options[0].value);
  const [isExtended, setIsExtended] = useState(false);
  const [isOnList, setIsOnList] = useState(false);
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const styles = useStyles();
  const theme = useTheme();
  const handlePress = () => setIsExtended((e) => !e);

  const handleBlur = () => {
    if (!isOnList) setIsExtended(false);
  };

  const renderOption = (option: Option) => (
    <motion.li
      whileHover={{
        backgroundColor: theme.colors.blue,
      }}
      style={styles.option}
      value={option.value}
      onClick={() => {
        field.onChange(option.value);
        setSelectedOption(option.value);
        setIsExtended(false);
      }}
    >
      {option.label}
    </motion.li>
  );

  const renderDescription = errors[p.name] ? <>{errors[p.name]?.message}</> : p.description;

  return (
    <div style={{ ...styles.selectContainer, ...p.style }}>
      <label style={styles.label}>{p.label}</label>
      <AnimatePresence mode='wait'>
        {isExtended && (
          <motion.ul
            onMouseEnter={() => setIsOnList(true)}
            onMouseLeave={() => setIsOnList(false)}
            initial={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            style={styles.optionsContainer}
          >
            <div>{p.options.map(renderOption)}</div>
          </motion.ul>
        )}
      </AnimatePresence>
      <input
        {...field}
        value={p.options.find((o) => o.value === selectedOption)?.label}
        style={styles.input}
        readOnly
        onClick={handlePress}
        onBlur={handleBlur}
      />
      <motion.div
        style={styles.chevron}
        animate={{ rotate: isExtended ? '180deg' : 0 }}
        transition={{ duration: 0.15 }}
      >
        <FaChevronDown size={20} fill={theme.colors.blue} />
      </motion.div>
      <AnimatePresence mode='wait'>
        {(isExtended || errors[p.name]) && (
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
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  selectContainer: {
    position: 'relative',
    marginBottom: t.spacing.l,
  },
  label: {
    position: 'absolute',
    left: t.spacing.m,
    color: t.colors.blue04,
    pointerEvents: 'none',
    top: 6,
    fontSize: 12,
  },
  input: {
    padding: t.spacing.m,
    paddingTop: t.spacing.l + 4,
    cursor: 'pointer',
    fontSize: '16px',
    border: 0,
    borderRadius: t.borderRadius.default,
    outline: 'none',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    userSelect: 'none',
    webkitUserSelect: 'none',
  },
  optionsContainer: {
    zIndex: 1,
    listStyle: 'none',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    left: 0,
    right: 0,
    top: `calc(100% + ${t.spacing.l}px)`,
    margin: 0,
    padding: t.spacing.s,
    gap: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
  },
  option: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
  },
  selectedOption: {
    marginTop: '10px',
    fontSize: '14px',
    color: t.colors.dark02,
  },
  chevron: {
    position: 'absolute',
    right: t.spacing.m,
    top: t.spacing.m + 4,
    pointerEvents: 'none',
  },
  description: {
    position: 'absolute',
    left: t.spacing.m,
    top: 60,
    fontSize: '12px',
    margin: 0,
    color: t.colors.blue04,
    opacity: 0,
  },
}));
