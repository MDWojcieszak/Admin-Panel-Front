import { Children, ReactNode, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';
import { mkUseStyles, useTheme } from '~/utils/theme';
import useMeasure from 'react-use-measure';

type SideMotionContainerProps = {
  children: ReactNode;
  cards: string[];
  initialCard?: number;
  cardWidth?: number;
};

type CardValue = SideMotionContainerProps['cards'][number];

export type SideMotionContainerRef = {
  setActiveCard: F1<CardValue>;
  getActiveCard: F0<CardValue>;
};

export const SideMotionContainer = forwardRef<SideMotionContainerRef, SideMotionContainerProps>((p, ref) => {
  const childrenaArray = Children.toArray(p.children);
  const theme = useTheme();
  const styles = useStyles();
  const [activeCard, setActiveCard] = useState<CardValue>(p.cards[p.initialCard || 0]);
  const [height, setHeight] = useState<number>();
  useImperativeHandle(ref, () => ({
    getActiveCard: () => activeCard,
    setActiveCard: (card) => {
      setActiveCard(card);
    },
  }));

  return (
    <motion.div
      style={{ ...styles.container, width: p.cardWidth }}
      animate={{ height: height }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        style={styles.contentContainer}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        animate={{ translateX: p.cards.findIndex((c) => c === activeCard) * -((p.cardWidth || 0) + theme.spacing.m) }}
      >
        {Children.map(childrenaArray, (child, index) => {
          const isActive = p.cards[index] === activeCard;
          return (
            <motion.div animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              <Card isActive={isActive} setHeight={setHeight} width={p.cardWidth}>
                {child}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
});

type CardProps = {
  children: ReactNode;
  isActive: boolean;
  width?: number;
  setHeight: F1<number>;
};

const Card = (p: CardProps) => {
  const [ref, { height }] = useMeasure();

  useEffect(() => {
    if (!p.isActive || !height) return;
    p.setHeight(height);
  }, [p.isActive, height]);
  return (
    <div ref={ref} style={{ width: p.width }}>
      {p.children}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    overflow: 'hidden',
  },
  contentContainer: {
    gap: t.spacing.m,
    flexDirection: 'row',
  },
}));
