import { format } from 'date-fns';
import { ReactNode, useState } from 'react';
import { FaCodeBranch, FaServer } from 'react-icons/fa6';
import { FiChevronRight } from 'react-icons/fi';
import {
  MdArticle,
  MdCalendarMonth,
  MdChecklist,
  MdCollections,
  MdContentPaste,
  MdFolder,
  MdGroup,
  MdHub,
  MdInbox,
  MdKeyboard,
  MdMonitorHeart,
  MdPhoneIphone,
  MdPhotoCamera,
  MdShield,
  MdSpaceDashboard,
  MdTouchApp,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Permission, hasAccess } from '~/acl/permissions';
import { CenteredCard } from '~/components/CenteredCard';
import { useAuth } from '~/hooks/useAuth';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useCan, usePermissions } from '~/hooks/usePermissions';
import { MainNavigationRoute } from '~/navigation/types';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Section = {
  icon: ReactNode;
  title: string;
  text: string;
  path: MainNavigationRoute;
  /** Same gate as the menu item; without it the section is open to everyone. */
  permission?: Permission | Permission[];
};

/** What the panel holds, in the menu's order and grouping. */
const AREAS: { title: string; sections: Section[] }[] = [
  {
    title: 'Overview',
    sections: [
      {
        icon: <MdSpaceDashboard size={20} />,
        title: 'Dashboard',
        text: 'What needs attention, your tasks for today, servers, gallery numbers and 7/30-day trends.',
        path: MainNavigationRoute.DASHBOARD,
      },
    ],
  },
  {
    title: 'Photography',
    sections: [
      {
        icon: <MdPhotoCamera size={20} />,
        title: 'Photography',
        text: 'Sessions on a board, a list or a calendar; the sky, the moon and the weather for a place; gear packed and used; folders, upload and progress; Immich albums.',
        path: MainNavigationRoute.PHOTO_MANAGEMENT,
        permission: ['photoEntry.read', 'gallery.manage'],
      },
      {
        icon: <MdCollections size={20} />,
        title: 'Gallery',
        text: 'Albums for the public site, the image library and its processing, Selected Work and home-page settings; publish straight from a session’s exports.',
        path: MainNavigationRoute.GALLERIES,
        permission: 'gallery.manage',
      },
      {
        icon: <MdInbox size={20} />,
        title: 'Inbox',
        text: 'Messages from the site’s contact form: read, reply by e-mail, archive, mark spam, keep notes.',
        path: MainNavigationRoute.INQUIRIES,
        permission: 'inquiry.read',
      },
      {
        icon: <MdArticle size={20} />,
        title: 'Blog',
        text: 'Posts in a block editor with editorial comments and versions; categories, places, countries, collections and the home page.',
        path: MainNavigationRoute.BLOG,
        permission: 'blog.read',
      },
    ],
  },
  {
    title: 'Projects',
    sections: [
      {
        icon: <MdChecklist size={20} />,
        title: 'Projects',
        text: 'Boards, shopping lists, trips and builds — with parts and costs, a build journal, templates, comments and share links; My work gathers what is on you.',
        path: MainNavigationRoute.PROJECTS,
      },
      {
        icon: <MdFolder size={20} />,
        title: 'Documents',
        text: 'Your files in one library — PDFs, images, 3D models with a preview — pinned to projects, tasks and parts.',
        path: MainNavigationRoute.DOCUMENTS,
      },
    ],
  },
  {
    title: 'Homelab',
    sections: [
      {
        icon: <FaServer size={18} />,
        title: 'Servers',
        text: 'Wake and power, live process terminals, commands, settings, disks and transfers.',
        path: MainNavigationRoute.SERVERS,
        permission: 'server.read',
      },
      {
        icon: <FaCodeBranch size={18} />,
        title: 'Deployments',
        text: 'Applications deployed by the panel: releases, live deploy steps, rollbacks, variables, Git sources and webhooks.',
        path: MainNavigationRoute.DEPLOY,
        permission: 'deploy.read',
      },
      {
        icon: <MdMonitorHeart size={20} />,
        title: 'System Status',
        text: 'Whether the backend, the database, the agents and the integrations are healthy.',
        path: MainNavigationRoute.SYSTEM_STATUS,
        permission: 'system.read',
      },
    ],
  },
  {
    title: 'People & access',
    sections: [
      {
        icon: <MdGroup size={20} />,
        title: 'Users',
        text: 'Accounts, invitations and their sessions.',
        path: MainNavigationRoute.ACCOUNTS,
        permission: 'user.read',
      },
      {
        icon: <MdShield size={20} />,
        title: 'Access Control',
        text: 'Permission groups and who is in them; the owner can do everything.',
        path: MainNavigationRoute.ACCESS_CONTROL,
        permission: ['acl.manage', 'acl.assign'],
      },
      {
        icon: <MdHub size={20} />,
        title: 'Integrations',
        text: 'Connected apps and devices, API tokens and Immich.',
        path: MainNavigationRoute.INTEGRATIONS,
      },
    ],
  },
];

/** The things worth knowing that no menu shows. */
const TIPS: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <MdKeyboard size={18} />,
    title: 'Press N anywhere',
    text: 'Quick capture: a task straight into your inbox, sorted into a project later.',
  },
  {
    icon: <MdContentPaste size={18} />,
    title: 'Paste a whole list',
    text: 'Several lines pasted into a task field become a task each — "2 kg flour" keeps its amount.',
  },
  {
    icon: <MdContentPaste size={18} />,
    title: 'Plan with a chat',
    text: 'Import → Format → Copy a prompt for a chat: its answer pastes back as tasks or parts, checked row by row before anything is added.',
  },
  {
    icon: <MdCalendarMonth size={18} />,
    title: 'Tasks in your phone’s calendar',
    text: 'User Settings → Calendar on your phone: due dates and reminders, subscribed once.',
  },
  {
    icon: <MdPhoneIphone size={18} />,
    title: 'Works on a phone',
    text: 'A menu that slides in, sheets from the bottom; the few sections that need a big screen say so.',
  },
  {
    icon: <MdTouchApp size={18} />,
    title: 'Drag on touch',
    text: 'Hold a card on a project board for a moment, then drag it to another column.',
  },
];

/** "api.whcp.pl" from the configured API address. */
const apiHost = () => {
  try {
    return new URL(import.meta.env.VITE_API_URL as string).host;
  } catch {
    return '';
  }
};

export const About = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const can = useCan();
  const isMobile = useIsMobile();
  const { role } = usePermissions();
  const email = useAuth().userData?.email;
  const [hovered, setHovered] = useState<string>();

  const built = new Date(__BUILD_DATE__);
  const host = apiHost();

  return (
    <CenteredCard maxWidth={820}>
      <div style={styles.hero}>
        <img src='/full_logo.png' alt='Applogy' style={styles.logo} />
        <span style={styles.tagline}>Homelab, photography and projects — one panel for all of it.</span>
      </div>

      {AREAS.map((area) => (
        <div key={area.title} style={styles.area}>
          <span style={styles.areaTitle}>{area.title}</span>
          <div style={styles.grid}>
            {area.sections.map((section) => {
              const open = hasAccess(can, section.permission);
              const hover = hovered === section.path && open;
              return (
                <button
                  key={section.path}
                  type='button'
                  disabled={!open}
                  title={open ? `Open ${section.title}` : 'Not available to your account'}
                  onClick={() => navigate('/' + section.path)}
                  onMouseEnter={() => setHovered(section.path)}
                  onMouseLeave={() => setHovered((h) => (h === section.path ? undefined : h))}
                  style={{
                    ...styles.section,
                    ...(hover ? styles.sectionHover : null),
                    ...(open ? null : styles.sectionLocked),
                  }}
                >
                  <span style={styles.sectionIcon}>{section.icon}</span>
                  <span style={styles.sectionText}>
                    <span style={styles.sectionTitle}>{section.title}</span>
                    <span style={styles.sectionDesc}>{section.text}</span>
                  </span>
                  {open && !isMobile ? (
                    <FiChevronRight
                      size={16}
                      color={hover ? theme.colors.white : theme.colors.dark05}
                      style={{ flexShrink: 0, alignSelf: 'center' }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={styles.area}>
        <span style={styles.areaTitle}>Good to know</span>
        <div style={styles.grid}>
          {TIPS.map((tip) => (
            <div key={tip.title} style={styles.tip}>
              <span style={styles.tipIcon}>{tip.icon}</span>
              <span style={styles.sectionText}>
                <span style={styles.tipTitle}>{tip.title}</span>
                <span style={styles.sectionDesc}>{tip.text}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.build}>
        <span>
          Built {format(built, 'd MMM yyyy, HH:mm')}
          {__BUILD_COMMIT__ ? ` · ${__BUILD_COMMIT__}` : ''}
        </span>
        {host ? <span>API {host}</span> : null}
        {email ? (
          <span>
            Signed in as {email}
            {role ? ` · ${role}` : ''}
          </span>
        ) : null}
        <span>React, TypeScript &amp; Vite</span>
      </div>
    </CenteredCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  hero: { alignItems: 'center', gap: t.spacing.s },
  logo: { display: 'block', width: 200, maxWidth: '70%', height: 'auto', objectFit: 'contain' },
  tagline: { textAlign: 'center', color: t.colors.dark05, fontSize: 14 },
  area: { gap: t.spacing.s },
  areaTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
    gap: t.spacing.s,
  },
  section: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
    padding: t.spacing.sm,
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    border: 'none',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    transition: 'background-color 0.12s ease',
  },
  sectionHover: { backgroundColor: t.colors.gray02 + t.colorOpacity(0.8) },
  sectionLocked: { cursor: 'default', opacity: 0.45 },
  sectionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: t.borderRadius.default,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  sectionText: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 },
  sectionTitle: { fontWeight: 700, fontSize: 15, color: t.colors.white },
  sectionDesc: { fontSize: 13, lineHeight: 1.45, color: t.colors.dark05 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.large,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  tipIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    color: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
  },
  tipTitle: { fontWeight: 700, fontSize: 14, color: t.colors.white },
  build: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: t.spacing.m,
    rowGap: 2,
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    fontSize: 12,
    color: t.colors.dark05,
    textAlign: 'center',
  },
}));
