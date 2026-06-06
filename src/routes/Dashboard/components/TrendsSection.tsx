import { ReactNode } from 'react';
import { BsCalendar3, BsImages } from 'react-icons/bs';
import { FaCameraRotate } from 'react-icons/fa6';
import { MdGroup, MdTerminal } from 'react-icons/md';
import { TrendsRange } from '~/api/api';
import { Loader } from '~/components/Loader';
import { MiniBars, MiniLineChart } from '~/components/MiniChart';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useDashboardTrends } from '~/routes/Dashboard/hooks/useDashboardTrends';
import { mkUseStyles, useTheme } from '~/utils/theme';

const sumBy = <T,>(arr: T[], pick: (item: T) => number) => arr.reduce((acc, item) => acc + pick(item), 0);

const ChartCard = ({
  title,
  icon,
  total,
  children,
}: {
  title: string;
  icon: ReactNode;
  total: number;
  children: ReactNode;
}) => {
  const styles = useStyles();
  return (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <div style={styles.chartTitleWrap}>
          {icon}
          <span style={styles.chartTitle}>{title}</span>
        </div>
        <span style={styles.chartTotal}>{total}</span>
      </div>
      {children}
    </div>
  );
};

export const TrendsSection = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { trends, loading, range, setRange } = useDashboardTrends();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Trends</span>
        <SegmentedTabs
          layoutId='trends-range'
          items={[
            { label: '7 days', value: TrendsRange._7d },
            { label: '30 days', value: TrendsRange._30d },
          ]}
          selected={range}
          handleSelect={(v) => setRange(v as TrendsRange)}
        />
      </div>

      {loading && !trends ? (
        <Loader />
      ) : !trends ? (
        <span style={styles.muted}>No trend data.</span>
      ) : (
        <div style={styles.grid}>
          <ChartCard title='Images added' icon={<BsImages size={14} />} total={sumBy(trends.series.imagesAdded, (p) => p.count)}>
            <MiniLineChart series={[{ values: trends.series.imagesAdded.map((p) => p.count), color: theme.colors.blue, fill: true }]} />
          </ChartCard>

          <ChartCard
            title='Photo entries created'
            icon={<FaCameraRotate size={14} />}
            total={sumBy(trends.series.photoEntriesCreated, (p) => p.count)}
          >
            <MiniLineChart
              series={[{ values: trends.series.photoEntriesCreated.map((p) => p.count), color: theme.colors.purple02, fill: true }]}
            />
          </ChartCard>

          <ChartCard title='New users' icon={<MdGroup size={15} />} total={sumBy(trends.series.newUsers, (p) => p.count)}>
            <MiniLineChart series={[{ values: trends.series.newUsers.map((p) => p.count), color: theme.colors.lightGreen, fill: true }]} />
          </ChartCard>

          <ChartCard
            title='Processes · total / failed'
            icon={<MdTerminal size={15} />}
            total={sumBy(trends.series.processes, (p) => p.total)}
          >
            <MiniLineChart
              series={[
                { values: trends.series.processes.map((p) => p.total), color: theme.colors.blue04 },
                { values: trends.series.processes.map((p) => p.failed), color: theme.colors.red },
              ]}
            />
          </ChartCard>

          <ChartCard
            title='Photos by date taken · 12 mo'
            icon={<BsCalendar3 size={13} />}
            total={sumBy(trends.series.photosByTaken, (p) => p.count)}
          >
            <MiniBars values={trends.series.photosByTaken.map((p) => p.count)} color={theme.colors.blue03} />
          </ChartCard>
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  chartCard: {
    flex: 1,
    minWidth: 260,
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    minWidth: 0,
    color: t.colors.blue04,
  },
  chartTitle: {
    fontSize: 13,
    color: t.colors.blue04,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chartTotal: {
    fontSize: 18,
    fontWeight: 800,
  },
  muted: {
    color: t.colors.dark05,
    fontSize: 13,
  },
}));
