import { useState } from 'react';
import { Button } from '~/components/Button';
import { DateField, TextField } from '~/components/ControlledFields';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { fromDateInput, toDateInput } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

export type DuplicateMode = 'copy' | 'template' | 'fromTemplate';

type DuplicateProjectModalProps = {
  projectId: string;
  sourceTitle: string;
  mode: DuplicateMode;
  onCreated?: (id: string) => void;
} & Partial<InternalModalProps>;

const INTRO: Record<DuplicateMode, string> = {
  copy: 'A fresh copy of the plan: tasks, checklists and parts, nothing ticked. People, links, the journal and comments stay here.',
  template: 'A template keeps the plan to start new projects from. It stays out of your project list.',
  fromTemplate: 'A new project from this template. Dates move with the start you pick.',
};

/** Copy, save as a template, or start from one (D12): one call, three faces. */
export const DuplicateProjectModal = (p: DuplicateProjectModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const toast = useToast();
  const { projectsApi } = useApi();
  const [title, setTitle] = useState(
    p.mode === 'template' ? `${p.sourceTitle} template` : p.mode === 'copy' ? `${p.sourceTitle} (copy)` : '',
  );
  const [startDate, setStartDate] = useState(p.mode === 'template' ? '' : toDateInput(new Date().toISOString()));
  const [asTemplate, setAsTemplate] = useState(p.mode === 'template');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!projectsApi || !title.trim()) return;
    setSaving(true);
    try {
      const { data } = await projectsApi.projectControllerDuplicate({
        id: p.projectId,
        duplicateProjectDto: {
          title: title.trim(),
          // Empty keeps the source's start, and so its dates.
          startDate: startDate ? fromDateInput(startDate) : undefined,
          asTemplate,
        },
      });
      if (data.skippedDocuments) {
        toast(
          `${data.skippedDocuments} file${data.skippedDocuments === 1 ? '' : 's'} pinned by others stayed behind.`,
          'info',
        );
      }
      p.handleClose?.();
      p.onCreated?.(data.project.id);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not copy the project.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={shared.muted}>{INTRO[p.mode]}</span>
      <TextField
        label='Title'
        autoFocus
        value={title}
        placeholder='New project'
        onChange={setTitle}
        onEnter={() => save()}
      />
      <DateField label='Start' value={startDate} onChange={setStartDate} />
      {p.mode === 'copy' ? (
        <Switch checked={asTemplate} onChange={setAsTemplate} label='Keep it as a template' />
      ) : null}
      <Button
        label={asTemplate ? 'Save template' : 'Create project'}
        onClick={save}
        loading={saving}
        disabled={!title.trim()}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(460px, 90vw)' },
}));
