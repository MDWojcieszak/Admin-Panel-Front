import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '~/components/Button';
import { GlassCard } from '~/components/GlassCard';
import { MainNavigationRoute } from '~/navigation/types';
import { mkUseStyles } from '~/utils/theme';

export const NotFound = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const goBack = () => {
    navigate('/' + MainNavigationRoute.DASHBOARD);
  };
  return (
    <GlassCard style={styles.container}>
      <motion.h1
        style={styles.title}
        initial={{ x: 0 }}
        animate={{
          x: [10, -10, 10, -10, 10], // Simple bounce/shake
          transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          },
        }}
      >
        404
      </motion.h1>
      <p style={styles.text}>Oops! The page you’re looking for doesn’t exist.</p>
      <p style={styles.text}>But don’t worry, we’ve got your back!</p>
      <Button label='Get me out of here' style={styles.button} onClick={goBack} />
    </GlassCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 'auto',
    alignSelf: 'center',
    padding: t.spacing.m,
    minWidth: 300,
    maxWidth: 600,
    textAlign: 'center',
  },
  title: {
    alignSelf: 'center',
    userSelect: 'none',
    marginBottom: t.spacing.s,
    fontSize: 48,
    color: t.colors.lightBlue,
  },
  text: {
    color: t.colors.lightBlue,
    alignItems: 'center',
    fontSize: 16,
    userSelect: 'none',
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
