import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiMinus, FiX } from 'react-icons/fi';
import { ReleaseStatus } from '~/api/api';
import { Loader } from '~/components/Loader';
import { DeployStep, useDeploySteps } from '~/routes/Deploy/hooks/useDeploySteps';
import { mkUseStyles, useTheme } from '~/utils/theme';

const StepIcon = ({ step }: { step: DeployStep }) => {
  const styles = useStyles();
  const theme = useTheme();
  const color =
    step.state === 'done'
      ? theme.colors.lightGreen
      : step.state === 'failed'
        ? theme.colors.red
        : step.state === 'running'
          ? theme.colors.blue
          : theme.colors.dark04;
  return (
    <span style={{ ...styles.icon, color, borderColor: color, backgroundColor: color + theme.colorOpacity(0.14) }}>
      {step.state === 'done' ? (
        <FiCheck size={13} strokeWidth={3} />
      ) : step.state === 'failed' ? (
        <FiX size={13} strokeWidth={3} />
      ) : step.state === 'running' ? (
        <motion.span
          style={styles.pulse}
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1, 0.85] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <FiMinus size={12} />
      )}
    </span>
  );
};

/** build → pull → up → health, each ticked, crossed, running or grey when it never ran. */
export const DeploySteps = ({ processId, releaseStatus }: { processId: string; releaseStatus?: ReleaseStatus }) => {
  const styles = useStyles();
  const theme = useTheme();
  const { steps, loading } = useDeploySteps(processId, releaseStatus);

  if (loading) {
    return (
      <div style={styles.row}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={styles.row}>
      {steps.map((step, i) => (
        <Fragment key={step.key}>
          {i > 0 ? (
            <span
              style={{
                ...styles.connector,
                backgroundColor:
                  step.state === 'idle' ? theme.colors.white + theme.colorOpacity(0.08) : theme.colors.dark04,
              }}
            />
          ) : null}
          <div style={styles.step}>
            <StepIcon step={step} />
            <span style={{ ...styles.label, color: step.state === 'idle' ? theme.colors.dark04 : theme.colors.white }}>
              {step.label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 32 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    boxSizing: 'border-box',
    borderRadius: '50%',
    borderWidth: 1.5,
    borderStyle: 'solid',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: t.colors.blue,
  },
  label: { fontSize: 13, fontWeight: 600 },
  connector: { width: 28, height: 2, borderRadius: 1 },
}));
