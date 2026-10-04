import { useEffect, useState } from 'react';
import { FiCheckCircle, FiInfo, FiLock } from 'react-icons/fi';
import { ComposeCheckResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { useApi } from '~/hooks/useApi';
import { useDeployStyles } from '~/routes/Deploy/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';

export const COMPOSE_HINT =
  'Inline passwords are moved into encrypted environment entries on save and read back as ${KEY}. ' +
  'Use absolute host paths for volumes (/mnt/VAULT/APPS/…). Variables come from the .env the agent ' +
  'writes next to the file — define them in Environment.';

/** Rechecked this long after the last keystroke. */
const CHECK_DELAY = 600;

type ComposeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  /** Keys already defined in the application's environment. */
  definedKeys?: string[];
  readOnly?: boolean;
  rows?: number;
  onCheck?: (result?: ComposeCheckResponse, error?: string) => void;
  /** For a git application: runs from the clone, relative builds are the repository's code. */
  inClone?: boolean;
};

/**
 * A compose file being written, checked against the backend as it changes:
 * what would be stored, which secrets would move, which variables it reads.
 */
export const ComposeEditor = ({
  value,
  onChange,
  definedKeys,
  readOnly,
  rows,
  onCheck,
  inClone,
}: ComposeEditorProps) => {
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const [check, setCheck] = useState<ComposeCheckResponse>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!deployApi || !value.trim()) {
      setCheck(undefined);
      setError(undefined);
      onCheck?.(undefined, undefined);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await deployApi.deployControllerCheckCompose({
          checkComposeDto: { compose: value, inClone },
        });
        if (!active) return;
        setCheck(data);
        setError(undefined);
        onCheck?.(data, undefined);
      } catch (e) {
        if (!active) return;
        const message = getApiErrorMessage(e, 'The file could not be checked.');
        setCheck(undefined);
        setError(message);
        onCheck?.(undefined, message);
      }
    }, CHECK_DELAY);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployApi, value, inClone]);

  const defined = new Set(definedKeys ?? []);
  const undefinedVars = (check?.variables ?? []).filter(
    (v) => !v.hasDefault && !defined.has(v.key) && !check?.movedSecrets.includes(v.key),
  );

  return (
    <div style={{ gap: 8 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? Math.min(34, Math.max(12, value.split('\n').length + 2))}
        spellCheck={false}
        readOnly={readOnly}
        placeholder={'services:\n  app:\n    image: nginx:1.27\n    environment:\n      DB_PASSWORD: ${DB_PASSWORD}'}
        style={shared.textArea}
      />
      {error ? <div style={shared.error}>{error}</div> : null}
      {check ? (
        <>
          {check.movedSecrets.length ? (
            <div style={shared.warning}>
              <FiLock size={14} />
              <span>
                On save, {check.movedSecrets.join(', ')} move{check.movedSecrets.length === 1 ? 's' : ''} out of the
                file into encrypted environment entries.
              </span>
            </div>
          ) : null}
          {check.notes
            .filter((note) => !note.startsWith('Moved '))
            .map((note, i) => (
              <div key={i} style={{ ...shared.row, ...shared.muted }}>
                <FiInfo size={13} /> {note}
              </div>
            ))}
          {undefinedVars.length ? (
            <div style={shared.warning}>
              <FiInfo size={14} />
              <span>
                Read by the file but not defined yet: <b>{undefinedVars.map((v) => v.key).join(', ')}</b>. A deployment
                is blocked until they are set in Environment.
              </span>
            </div>
          ) : null}
          {!check.movedSecrets.length && !undefinedVars.length ? (
            <div style={{ ...shared.row, ...shared.muted }}>
              <FiCheckCircle size={13} /> Valid compose file
              {check.buildMode === 'COMPOSE' ? <Badge label='builds locally' tone='blue' /> : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
