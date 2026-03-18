import { HiOutlineSparkles } from 'react-icons/hi';
import { AstroObjectResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Scrollbar } from '~/components/Scrollbar';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { motion } from 'framer-motion';
import { TbGalaxy } from 'react-icons/tb';

type AstroObjectSidebarProps = {
  astroObjects: AstroObjectResponse[];
  total: number;
  selectedAstroObjectId?: string;
  onObjectClick: (astrframeroObject: AstroObjectResponse) => void;
  onAddAstroObject: () => void;
};

export const AstroObjectSidebar = ({
  astroObjects,
  total,
  selectedAstroObjectId,
  onObjectClick,
  onAddAstroObject,
}: AstroObjectSidebarProps) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <div style={styles.title}>Astro Objects</div>
          <div style={styles.subtitle}>{total} available targets</div>
        </div>

        <Button
          variant='secondary'
          label='Create'
          icon={<HiOutlineSparkles color={theme.colors.purple02} />}
          onClick={onAddAstroObject}
        />
      </div>

      <Scrollbar style={styles.scrollbar}>
        <div style={styles.list}>
          {astroObjects.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No astro objects yet</div>
              <div style={styles.emptySubtitle}>Add your first target to get started.</div>
            </div>
          ) : (
            astroObjects.map((astroObject) => {
              const isSelected = astroObject.id === selectedAstroObjectId;

              return (
                <motion.button
                  key={astroObject.id}
                  type='button'
                  onClick={() => onObjectClick(astroObject)}
                  animate={{
                    background: isSelected ? theme.colors.gray03 : 'transparent',
                  }}
                  whileHover={{
                    background: theme.colors.gray03,
                  }}
                  style={styles.row}
                >
                  <motion.div
                    animate={{
                      color: isSelected ? theme.colors.purple02 : theme.colors.dark05,
                      background: isSelected ? theme.colors.purple02 + theme.colorOpacity(0.14) : 'transparent',
                    }}
                    style={styles.icon}
                  >
                    <TbGalaxy size={20} />
                  </motion.div>

                  <div style={styles.content}>
                    <div style={styles.topLine}>
                      <div style={styles.name}>{astroObject.name}</div>
                      {astroObject.code ? <div style={styles.code}>{astroObject.code}</div> : null}
                    </div>

                    <div style={styles.meta}>Updated {formatDate(astroObject.updatedAt)}</div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: t.colors.gray04 + t.colorOpacity(0.7),
    borderRadius: t.borderRadius.large,
    padding: t.spacing.m,
    gap: t.spacing.m,
  },

  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: t.colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: t.colors.dark05,
    marginTop: 2,
  },
  scrollbar: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginRight: t.spacing.m,
    paddingRight: t.spacing.s,
  },
  emptyState: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: t.colors.white,
  },
  emptySubtitle: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  row: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    border: 'none',
    background: 'transparent',
    borderRadius: 12,
    padding: '10px 10px 10px 12px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.18s ease, border-color 0.18s ease',
  },
  rowActive: {},
  rowAccent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 999,
    background: 'transparent',
    flexShrink: 0,
  },
  rowAccentActive: {
    background: t.colors.blue03,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: t.colors.dark05,
    background: t.colors.gray03 + t.colorOpacity(0.3),
  },

  content: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  topLine: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
    minWidth: 0,
    wordBreak: 'break-word' as const,
  },
  code: {
    fontSize: 14,
    color: t.colors.lightBlue,
    fontWeight: 500,
  },
  meta: {
    fontSize: 11,
    color: t.colors.dark05,
  },
}));
