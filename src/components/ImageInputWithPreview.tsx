import { AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
type ImageInputWithPreviewProps<T extends FieldValues> = { description?: string } & UseControllerProps<T>;

const HEIGHT = 250;
const WIDTH = 400;

export const ImageInputWithPreview = <T extends FieldValues>(p: ImageInputWithPreviewProps<T>) => {
  const [selectedFile, setSelectedFile] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const {
    field,
    formState: { errors },
  } = useController<T>({ name: p.name, control: p.control });
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = useStyles();
  const theme = useTheme();

  console.log(errors);
  const handleDragOver = (event: any) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(imageUrl);
      field.onChange(file);
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(imageUrl);
    }
  };
  const renderDescription = errors[p.name] ? <>{errors[p.name]?.message}</> : p.description;
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.contentContainer}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onHoverStart={() => setIsHover(true)}
        onHoverEnd={() => setIsHover(false)}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <input
          {...field}
          onChange={(event) => {
            handleFileChange(event);
            return field.onChange(event.target.files?.[0]);
          }}
          value={''}
          type='file'
          accept='.jpg, .jpeg, .png, .gif'
          style={styles.fileInput}
          ref={inputRef}
        />
        {selectedFile ? (
          <img src={selectedFile} alt='Selected' style={styles.previewImage} />
        ) : (
          <>
            <p>Drag & Drop</p>
            <motion.div
              animate={{ scale: isDragging ? 1.5 : 1 }}
              transition={{ repeatType: 'reverse', repeat: Infinity, duration: 0.5 }}
            >
              <FaPlus />
            </motion.div>
            <p> or Click</p>
          </>
        )}
      </motion.div>
      <AnimatePresence mode='wait'>
        {(isHover || errors[p.name]) && (
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
  container: {
    position: 'relative',
    marginBottom: t.spacing.l,
  },
  contentContainer: {
    color: t.colors.blue04,
    fontSize: '16px',
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    overflow: 'hidden',
    border: 0,
    outline: 'none',
    width: WIDTH,
    height: HEIGHT,
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  fileInput: {
    display: 'none',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  description: {
    position: 'absolute',
    left: t.spacing.m,
    top: HEIGHT,
    fontSize: '12px',
    margin: 0,
    opacity: 0,
  },
}));
