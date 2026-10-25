import { useEffect, useState } from 'react';
import { FiCompass, FiList, FiTool, FiTrello } from 'react-icons/fi';
import { ProjectSummaryResponse, ProjectType } from '~/api/api';
import { Button } from '~/components/Button';
import { DateField, SelectField, TextAreaField, TextField } from '~/components/ControlledFields';
import { OptionCards } from '~/components/OptionCards';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { fromDateInput, toDateInput, TYPE_DESCRIPTION, TYPE_LABEL } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type CreateProjectModalProps = {
  onCreated?: (id: string) => void;
} & Partial<InternalModalProps>;

const TYPE_ICON = {
  GENERAL: <FiTrello size={18} />,
  LIST: <FiList size={18} />,
  TRIP: <FiCompass size={18} />,
  DIY: <FiTool size={18} />,
};

/**
 * A blank project of a type, or one from a template (D12). The type only
 * picks the starting workflow and sections; it can be changed later.
 */
export const CreateProjectModal = (p: CreateProjectModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const { projectsApi } = useApi();
  const toast = useToast();
  const [templates, setTemplates] = useState<ProjectSummaryResponse[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [type, setType] = useState<ProjectType>(ProjectType.General);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [key, setKey] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState(toDateInput(new Date().toISOString()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectsApi) return;
    projectsApi
      .projectControllerList({ templates: true })
      .then(({ data }) => setTemplates(data))
      .catch(() => setTemplates([]));
  }, [projectsApi]);

  const template = templates.find((t) => t.id === templateId);

  const save = async () => {
    if (!projectsApi || !title.trim()) return;
    setSaving(true);
    try {
      let id: string;
      if (template) {
        const { data } = await projectsApi.projectControllerDuplicate({
          id: template.id,
          duplicateProjectDto: { title: title.trim(), startDate: fromDateInput(startDate) ?? undefined },
        });
        id = data.project.id;
      } else {
        const { data } = await projectsApi.projectControllerCreate({
          createProjectDto: {
            title: title.trim(),
            type,
            description: description.trim() || undefined,
            key: key.trim() ? key.trim().toUpperCase() : undefined,
            dueDate: fromDateInput(dueDate),
          },
        });
        id = data.id;
      }
      p.handleClose?.();
      p.onCreated?.(id);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the project.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const placeholder = template
    ? template.title
    : type === ProjectType.List
      ? 'Groceries'
      : type === ProjectType.Diy
        ? 'Astro mount'
        : 'Project';

  return (
    <div style={styles.container}>
      {templates.length ? (
        <SelectField
          label='Start from'
          value={templateId}
          options={[
            { value: '', label: 'A blank project' },
            ...templates.map((t) => ({ value: t.id, label: `Template: ${t.title}` })),
          ]}
          onChange={setTemplateId}
        />
      ) : null}
      {template ? null : (
        <OptionCards
          options={Object.values(ProjectType).map((value) => ({
            value,
            label: TYPE_LABEL[value],
            description: TYPE_DESCRIPTION[value],
            icon: TYPE_ICON[value],
          }))}
          selected={type}
          onSelect={(value) => setType(value as ProjectType)}
        />
      )}
      <TextField
        label='Title'
        autoFocus
        value={title}
        placeholder={placeholder}
        onChange={setTitle}
        onEnter={() => save()}
      />
      {template ? (
        <>
          <DateField label='Start' value={startDate} onChange={setStartDate} />
          <span style={shared.muted}>
            Tasks, checklists and parts come from the template, nothing ticked; its dates move with this start.
          </span>
        </>
      ) : (
        <>
          <TextAreaField label='Description' rows={3} value={description} onChange={setDescription} />
          <div style={shared.fieldGrid}>
            <TextField
              label='Key'
              value={key}
              maxLength={6}
              placeholder='From the title'
              transform={(value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '')}
              onChange={setKey}
            />
            <DateField label='Due' value={dueDate} onChange={setDueDate} />
          </div>
          <span style={shared.muted}>
            Tasks are numbered with the key: {key || 'KEY'}-1, {key || 'KEY'}-2…
          </span>
        </>
      )}
      <Button label='Create project' onClick={save} loading={saving} disabled={!title.trim()} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(560px, 90vw)' },
}));
