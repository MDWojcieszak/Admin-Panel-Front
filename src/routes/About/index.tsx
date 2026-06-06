import { ReactNode } from 'react';
import { BsImages, BsStars } from 'react-icons/bs';
import { FaServer } from 'react-icons/fa6';
import { MdBolt, MdDarkMode, MdGroup, MdLock, MdSpaceDashboard, MdKeyboard } from 'react-icons/md';
import { CenteredCard } from '~/components/CenteredCard';
import { mkUseStyles, useTheme } from '~/utils/theme';

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <FaServer size={18} />, title: 'Servers', text: 'Power, live process terminals, commands, settings & transfers.' },
  { icon: <BsImages size={18} />, title: 'Photo Library', text: 'Plan astro, work and general photo sessions and folders.' },
  { icon: <MdGroup size={20} />, title: 'Users & Access', text: 'Permission groups, sessions and fine-grained gating.' },
  { icon: <MdSpaceDashboard size={20} />, title: 'Dashboard', text: 'Overview, gallery insights and 7/30-day trends.' },
];

export const About = () => {
  const styles = useStyles();
  const theme = useTheme();

  const facts: { icon: ReactNode; text: string }[] = [
    { icon: <MdBolt size={15} color={theme.colors.yellow} />, text: 'Live logs & status stream over WebSockets' },
    { icon: <MdLock size={14} color={theme.colors.lightGreen} />, text: 'Permission-based access, OWNER bypasses all' },
    { icon: <BsStars size={14} color={theme.colors.purple02} />, text: 'Astro sessions — deep-sky or just the open sky' },
    { icon: <MdDarkMode size={15} color={theme.colors.blue04} />, text: 'Glassy dark UI, easy on the eyes' },
    { icon: <MdKeyboard size={16} color={theme.colors.blue} />, text: 'Fast, single-page, no full reloads' },
  ];

  return (
    <CenteredCard maxWidth={680}>
      <img src='/full_logo.png' alt='Applogy' style={styles.logo} />
      <span style={styles.tagline}>Your homelab &amp; photography control panel.</span>

      <div style={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={styles.feature}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <div style={styles.featureText}>
              <span style={styles.featureTitle}>{f.title}</span>
              <span style={styles.featureDesc}>{f.text}</span>
            </div>
          </div>
        ))}
      </div>

      <span style={styles.factsTitle}>Did you know?</span>
      <div style={styles.facts}>
        {facts.map((f, i) => (
          <div key={i} style={styles.fact}>
            <span style={styles.factIcon}>{f.icon}</span>
            <span>{f.text}</span>
          </div>
        ))}
      </div>

      <span style={styles.version}>Applogy · built with React, TypeScript &amp; Vite</span>
    </CenteredCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  logo: {
    display: 'block',
    width: 200,
    maxWidth: '70%',
    height: 'auto',
    objectFit: 'contain',
    alignSelf: 'center',
  },
  tagline: {
    alignSelf: 'center',
    textAlign: 'center',
    color: t.colors.dark05,
    fontSize: 14,
    marginTop: t.spacing.s,
  },
  features: {
    gap: t.spacing.s,
    marginTop: t.spacing.l,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  featureIcon: {
    width: 40,
    height: 40,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  featureText: {
    gap: 2,
    minWidth: 0,
  },
  featureTitle: {
    fontWeight: 700,
  },
  featureDesc: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  factsTitle: {
    fontWeight: 700,
    fontSize: 16,
    marginTop: t.spacing.l,
  },
  facts: {
    gap: t.spacing.s,
    marginTop: t.spacing.s,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontSize: 13,
    color: t.colors.white,
  },
  factIcon: {
    width: 22,
    minWidth: 22,
    alignItems: 'center',
  },
  version: {
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: t.spacing.l,
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
