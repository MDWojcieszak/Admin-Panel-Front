import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mkUseStyles } from '~/utils/theme';
import { LuInstagram } from 'react-icons/lu';
import { FaUser, FaImage, FaCog } from 'react-icons/fa'; // Import icons
import { Input } from '~/components/Input';
import { ImageInputWithPreview } from '~/components/ImageInputWithPreview';
import { Select } from '~/components/Select';
import { CalendarInput } from '~/components/CalendarInput';

export const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = useStyles();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={styles.container}>
      <motion.div style={styles.centerContainer}>
        <motion.img
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          src='logo.png'
          style={styles.logo}
          onClick={toggleMenu}
        />
      </motion.div>
      <div style={styles.menuOptions}>
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: isOpen ? 0 : -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <p style={styles.menuOption}>
            <FaUser style={styles.icon} /> ACCOUNTS
          </p>
          <p style={styles.menuOption}>
            <FaImage style={styles.icon} /> GALLERY
          </p>
          <p style={styles.menuOption}>
            <FaCog style={styles.icon} /> SETTINGS
          </p>

          <Input description='xDDDD' label='haha' />
          <ImageInputWithPreview />
          <Select />
          <CalendarInput />
        </motion.div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    display: 'flex',
    position: 'fixed',
    left: t.spacing.m,
    top: t.spacing.m,
    bottom: t.spacing.m,
    borderRadius: t.borderRadius.default,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '10vw',
    backgroundColor: t.colors.dark01,
    zIndex: 2,
  },
  centerContainer: {
    width: '100%',
    aspectRatio: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100px',
    height: '100px',
    borderRadius: 100,
    border: '4px',
    borderStyle: 'solid',
    borderColor: t.colors.dark03,
    cursor: 'pointer',
    userSelect: 'none',
  },
  menuOptions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '10px',
  },
  menuOption: {
    cursor: 'pointer',
    margin: '5px 0',
    color: t.colors.dark05,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: '8px',
  },
}));
