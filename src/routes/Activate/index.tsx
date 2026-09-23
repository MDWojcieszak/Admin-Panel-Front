import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiAlertTriangle, FiCheck, FiClock, FiSlash } from 'react-icons/fi';
import { DeviceApprovalRequestResponse, DeviceAuthorizationStatus } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { GlassCard } from '~/components/GlassCard';
import { Loader } from '~/components/Loader';
import { UserState } from '~/contexts/User/AuthContext';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';
import { usePermissionCatalog } from '~/hooks/usePermissionCatalog';
import { CommonNavigationRoute } from '~/navigation/types';
import { DeviceError, describeDeviceError } from '~/routes/Activate/deviceErrors';
import { PlatformIcon, platformLabel } from '~/utils/integrationPlatform';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { formatUserCode, isCompleteUserCode, normalizeUserCode } from '~/utils/userCode';

/** `9:42`, counting the approval window down so a stale screen is obvious. */
const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export const Activate = () => {
  const styles = useStyles();
  const theme = useTheme();
  const auth = useAuth();
  const location = useLocation();
  const { integrationsApi } = useApi();
  const [searchParams] = useSearchParams();

  const isLoggedIn = auth.userState === UserState.LOGGED_IN;
  const { describe, loading: catalogLoading } = usePermissionCatalog(isLoggedIn);

  const [code, setCode] = useState(() => formatUserCode(searchParams.get('code') ?? ''));
  const [request, setRequest] = useState<DeviceApprovalRequestResponse>();
  const [status, setStatus] = useState<DeviceAuthorizationStatus>();
  const [error, setError] = useState<DeviceError>();
  const [loading, setLoading] = useState(false);
  const [deciding, setDeciding] = useState<DeviceAuthorizationStatus>();
  const [now, setNow] = useState(() => Date.now());

  const lookup = useCallback(
    async (rawCode: string) => {
      if (!integrationsApi) return;
      setLoading(true);
      setError(undefined);
      try {
        const { data } = await integrationsApi.integrationControllerGetPendingDevice({
          userCode: normalizeUserCode(rawCode),
        });
        setRequest(data);
      } catch (e) {
        setRequest(undefined);
        setError(describeDeviceError(e));
      } finally {
        setLoading(false);
      }
    },
    [integrationsApi],
  );

  // A code arriving in the URL is looked up once. Re-running on every render of
  // a rate-limited screen would spend the user's remaining attempts for them.
  const autoLookedUp = useRef(false);
  useEffect(() => {
    const fromUrl = searchParams.get('code');
    if (!isLoggedIn || !integrationsApi || autoLookedUp.current || !fromUrl) return;
    if (!isCompleteUserCode(fromUrl)) return;
    autoLookedUp.current = true;
    lookup(fromUrl);
  }, [isLoggedIn, integrationsApi, searchParams, lookup]);

  useEffect(() => {
    if (!request || status) return;
    // Re-read the clock up front: `now` may be minutes stale if the user sat on
    // the entry screen, which would misreport the window as still open.
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [request, status]);

  const remainingMs = useMemo(() => (request ? new Date(request.expiresAt).getTime() - now : 0), [request, now]);
  const expired = Boolean(request) && remainingMs <= 0;

  const decide = async (decision: DeviceAuthorizationStatus) => {
    if (!integrationsApi || !request) return;
    setDeciding(decision);
    setError(undefined);
    try {
      const userCode = normalizeUserCode(request.userCode);
      const { data } =
        decision === DeviceAuthorizationStatus.Approved
          ? await integrationsApi.integrationControllerApproveDevice({ userCode })
          : await integrationsApi.integrationControllerDenyDevice({ userCode });
      setStatus(data.status);
    } catch (e) {
      const failure = describeDeviceError(e);
      setError(failure);
      // Expired or already used: the decision can no longer land, so drop the
      // review screen rather than leaving a dead Authorize button on it.
      if (!failure.retryable) setRequest(undefined);
    } finally {
      setDeciding(undefined);
    }
  };

  const restart = () => {
    autoLookedUp.current = true;
    setRequest(undefined);
    setStatus(undefined);
    setError(undefined);
    setCode('');
  };

  if (auth.userState === UserState.UNKNOWN) {
    return (
      <GlassCard style={styles.card}>
        <Loader />
      </GlassCard>
    );
  }

  // The approval screen is the only place the user sees what they are granting,
  // so it must be them approving it — bounce through login and come straight back.
  if (!isLoggedIn) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate replace to={`/${CommonNavigationRoute.SIGN_IN}?returnUrl=${returnUrl}`} />;
  }

  const renderOutcome = () => {
    const approved = status === DeviceAuthorizationStatus.Approved;
    return (
      <>
        <div style={{ ...styles.outcomeIcon, ...(approved ? styles.outcomeOk : styles.outcomeNo) }}>
          {approved ? <FiCheck size={30} /> : <FiSlash size={28} />}
        </div>
        <h1 style={styles.title}>{approved ? 'All set' : 'Request denied'}</h1>
        <span style={styles.subtitle}>
          {approved
            ? `${request?.clientName ?? 'The app'} now has access. Return to the app — it picks up the rest on its own.`
            : `${request?.clientName ?? 'The app'} was not granted access. You can close this page.`}
        </span>
      </>
    );
  };

  const renderReview = () => {
    if (!request) return null;
    return (
      <>
        <h1 style={styles.title}>Authorize this app?</h1>

        <div style={styles.clientRow}>
          <div style={styles.clientIcon}>
            <PlatformIcon platform={request.platform} size={22} color={theme.colors.blue04} />
          </div>
          <div style={styles.clientText}>
            <span style={styles.clientName}>{request.clientName}</span>
            <span style={styles.clientPlatform}>{platformLabel(request.platform)}</span>
          </div>
          <Badge label={formatUserCode(request.userCode)} tone='neutral' />
        </div>

        <div style={styles.scopeBlock}>
          <span style={styles.scopeHeading}>This app will be able to:</span>
          {catalogLoading ? (
            <Loader />
          ) : (
            <div style={styles.scopeList}>
              {request.scopes.map((scope) => (
                <div key={scope} style={styles.scopeRow}>
                  <span style={styles.scopeDot} />
                  <div style={styles.scopeText}>
                    <span style={styles.scopeLabel}>{describe(scope)}</span>
                    <span style={styles.scopeKey}>{scope}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {expired ? (
          <div style={styles.warningBanner}>
            <FiAlertTriangle size={16} />
            <span>This code has expired. Click “Authorize” in the app again to get a new one.</span>
          </div>
        ) : (
          <div style={styles.countdown}>
            <FiClock size={14} />
            <span>Code expires in {formatCountdown(remainingMs)}</span>
          </div>
        )}

        {error ? <div style={styles.errorBanner}>{error.message}</div> : null}

        <div style={styles.actions}>
          <Button
            label='Deny'
            variant='secondary'
            onClick={() => decide(DeviceAuthorizationStatus.Denied)}
            loading={deciding === DeviceAuthorizationStatus.Denied}
            disabled={expired || Boolean(deciding)}
          />
          <Button
            label='Authorize'
            onClick={() => decide(DeviceAuthorizationStatus.Approved)}
            loading={deciding === DeviceAuthorizationStatus.Approved}
            disabled={expired || Boolean(deciding)}
          />
        </div>
      </>
    );
  };

  const renderEntry = () => (
    <>
      <h1 style={styles.title}>Connect an app</h1>
      <span style={styles.subtitle}>Enter the code shown in the app you want to authorize.</span>

      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(formatUserCode(e.target.value))}
        placeholder='WXYZ-2345'
        spellCheck={false}
        autoComplete='off'
        style={styles.codeInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isCompleteUserCode(code)) lookup(code);
        }}
      />

      {error ? <div style={styles.errorBanner}>{error.message}</div> : null}

      <Button
        label='Continue'
        onClick={() => lookup(code)}
        loading={loading}
        disabled={!isCompleteUserCode(code) || loading}
      />
    </>
  );

  const renderDeadEnd = () => (
    <>
      <div style={{ ...styles.outcomeIcon, ...styles.outcomeNo }}>
        <FiAlertTriangle size={26} />
      </div>
      <h1 style={styles.title}>Can’t use this code</h1>
      <span style={styles.subtitle}>{error?.message}</span>
      <Button label='Enter a different code' variant='secondary' onClick={restart} />
    </>
  );

  const body = () => {
    if (status) return renderOutcome();
    if (loading && !request) return <Loader />;
    if (request) return renderReview();
    if (error && !error.retryable) return renderDeadEnd();
    return renderEntry();
  };

  return <GlassCard style={styles.card}>{body()}</GlassCard>;
};

const useStyles = mkUseStyles((t) => ({
  card: {
    margin: 'auto',
    alignSelf: 'center',
    gap: t.spacing.m,
    padding: t.spacing.l,
    width: 'min(440px, calc(100vw - 32px))',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: t.colors.dark05,
    textAlign: 'center',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  clientIcon: {
    width: 44,
    height: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.25)}`,
  },
  clientText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  clientName: {
    fontWeight: 700,
    fontSize: 16,
    wordBreak: 'break-word',
  },
  clientPlatform: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  scopeBlock: {
    gap: t.spacing.s,
  },
  scopeHeading: {
    fontSize: 13,
    fontWeight: 700,
    color: t.colors.blue04,
  },
  scopeList: {
    gap: t.spacing.s,
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.s,
  },
  scopeDot: {
    width: 6,
    height: 6,
    minWidth: 6,
    marginTop: 7,
    borderRadius: '50%',
    backgroundColor: t.colors.blue,
  },
  scopeText: {
    gap: 1,
    minWidth: 0,
  },
  scopeLabel: {
    fontSize: 14,
  },
  scopeKey: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: t.colors.dark05,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
    fontSize: 13,
    color: t.colors.dark05,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.28)}`,
  },
  errorBanner: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.red + t.colorOpacity(0.28)}`,
  },
  codeInput: {
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    fontFamily: 'monospace',
    fontSize: 22,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    outline: 'none',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
  },
  outcomeIcon: {
    width: 60,
    height: 60,
    minWidth: 60,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  outcomeOk: {
    color: t.colors.lightGreen,
    backgroundColor: t.colors.lightGreen + t.colorOpacity(0.14),
    border: `1px solid ${t.colors.lightGreen + t.colorOpacity(0.3)}`,
  },
  outcomeNo: {
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.red + t.colorOpacity(0.28)}`,
  },
}));
