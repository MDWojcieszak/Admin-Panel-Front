import { useState } from 'react';
import { FiAlertTriangle, FiInfo, FiLock } from 'react-icons/fi';
import { ApplicationDetailResponse, ComposeTakeoverPreviewResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { ComposeEditor } from '~/routes/Deploy/components/ComposeEditor';
import { DiffView, Section, useDeployStyles } from '~/routes/Deploy/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';

/**
 * Takes an adopted stack's own compose file under the panel's control as it
 * is — the lossless path. Secrets and relative paths are the only things that
 * change, and both are shown before anything is written.
 */
export const TakeoverSection = ({
  application,
  onChanged,
}: {
  application: ApplicationDetailResponse;
  onChanged: () => void;
}) => {
  const shared = useDeployStyles();
  const { deployApi } = useApi();
  const toast = useToast();
  const [preview, setPreview] = useState<ComposeTakeoverPreviewResponse>();
  const [busy, setBusy] = useState<'preview' | 'apply'>();
  // Pasting is the way round a file the agent cannot read: a path it does not
  // have mounted, or a stack merged from several files.
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const [readError, setReadError] = useState<string>();
  const [pasteError, setPasteError] = useState<string>();

  const body = () => ({ compose: pasting ? pasted : undefined });

  const load = async () => {
    if (!deployApi) return;
    setBusy('preview');
    try {
      const { data } = await deployApi.deployControllerPreviewTakeover({
        id: application.id,
        takeoverComposeDto: body(),
      });
      setPreview(data);
      setReadError(undefined);
    } catch (e) {
      const message = getApiErrorMessage(e, 'The agent could not read the stack files.');
      setPreview(undefined);
      if (pasting) {
        toast(message, 'error');
      } else {
        setReadError(message);
        setPasting(true);
      }
    } finally {
      setBusy(undefined);
    }
  };

  const apply = async () => {
    if (!deployApi) return;
    setBusy('apply');
    try {
      await deployApi.deployControllerApplyTakeover({ id: application.id, takeoverComposeDto: body() });
      setPreview(undefined);
      toast(
        preview?.variablesToFill.length
          ? 'Taken over — fill in the missing variables, then preview and deploy'
          : 'Taken over — preview and deploy to run it from the panel',
        'success',
      );
      onChanged();
    } catch (e) {
      toast(getApiErrorMessage(e, 'The takeover was refused.'), 'error');
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <Section
      title='Take over the compose file'
      description='Recommended. The stack keeps its own compose file, nothing is translated or lost. Nothing changes until you apply.'
      actions={
        <>
          <Button
            label={pasting ? 'Read from the host instead' : 'Paste the file'}
            variant='secondary'
            onClick={() => {
              setPasting((v) => !v);
              setPreview(undefined);
            }}
          />
          <Button
            label='Preview takeover'
            variant={preview ? 'secondary' : 'primary'}
            onClick={load}
            loading={busy === 'preview'}
            disabled={pasting && (!pasted.trim() || !!pasteError)}
          />
        </>
      }
    >
      {pasting ? (
        <>
          {readError ? (
            <div style={shared.warning}>
              <FiAlertTriangle size={14} />
              <span>
                {readError}. Paste the compose file of this stack instead — what is running is taken over as you paste
                it.
              </span>
            </div>
          ) : null}
          <ComposeEditor
            value={pasted}
            onChange={(value) => {
              setPasted(value);
              setPreview(undefined);
            }}
            rows={14}
            onCheck={(_, error) => setPasteError(error)}
          />
        </>
      ) : null}
      {preview ? (
        <>
          <span style={shared.muted}>
            Project <b style={shared.mono}>{preview.projectName}</b> is kept, so the next deployment updates the running
            containers instead of starting a second set.
            {preview.workingDir ? (
              <>
                {' '}
                The file moves from <span style={shared.mono}>{preview.workingDir}</span> into the homelab repository.
              </>
            ) : null}
          </span>
          {/* A pasted file's editor already lists the secrets that move. */}
          {preview.movedSecrets.length && !pasting ? (
            <div style={shared.warning}>
              <FiLock size={14} />
              <span>
                Moved into encrypted environment entries: <b>{preview.movedSecrets.join(', ')}</b>.
              </span>
            </div>
          ) : null}
          {preview.variablesToFill.length ? (
            <div style={shared.warning}>
              <FiAlertTriangle size={14} />
              <span>
                The file reads <b>{preview.variablesToFill.join(', ')}</b> without a value in the panel — most likely
                from the .env that sat next to it. Add them in Environment after taking over; a deployment is blocked
                until then.
              </span>
            </div>
          ) : null}
          {preview.notes
            .filter((note) => !note.startsWith('Moved '))
            .map((note, i) => (
              <div key={i} style={{ ...shared.row, ...shared.muted }}>
                <FiInfo size={13} /> {note}
              </div>
            ))}
          <span style={shared.fieldLabel}>
            Changes against the {pasting ? 'pasted file' : 'file on the host'} (secrets masked)
          </span>
          <DiffView before={preview.currentCompose} after={preview.compose} />
          <div style={shared.row}>
            <Button label='Take over' onClick={apply} loading={busy === 'apply'} />
          </div>
        </>
      ) : null}
    </Section>
  );
};
