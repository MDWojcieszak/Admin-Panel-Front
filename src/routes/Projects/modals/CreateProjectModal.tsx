import { useEffect, useState } from 'react';
import { FiCompass, FiList, FiTool, FiTrello } from 'react-icons/fi';
import { ProjectSummaryResponse, ProjectType } from '~/api/api';
import { Button } from '~/components/Button';
import { CardSelect } from '~/components/CardSelect';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { Field, PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
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

  return (
    <div style={styles.container}>
      {templates.length ? (
        <Field label='Start from'>
          <PlainSelect
            value={templateId}
            options={[
              { value: '', label: 'A blank project' },
              ...templates.map((t) => ({ value: t.id, label: `Template: ${t.title}` })),
            ]}
            onChange={setTemplateId}
          />
        </Field>
      ) : null}
      {template ? null : (
        <CardSelect
          items={Object.values(ProjectType).map((value) => ({
            value,
            label: `${TYPE_LABEL[value]} — ${TYPE_DESCRIPTION[value]}`,
            icon: TYPE_ICON[value],
          }))}
          selected={type}
          handleSelect={(value) => setType(value as ProjectType)}
        />
      )}
      <Field label='Title'>
        <input
          autoFocus
          style={shared.textInput}
          value={title}
          placeholder={
            template
              ? template.title
              : type === ProjectType.List
                ? 'Groceries'
                : type === ProjectType.Diy
                  ? 'Astro mount'
                  : 'Project'
          }
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
      </Field>
      {template ? (
        <>
          <Field label='Start'>
            <input
              type='date'
              style={shared.textInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <span style={shared.muted}>
            Tasks, checklists and parts come from the template, nothing ticked; its dates move with this start.
          </span>
        </>
      ) : (
        <>
          <Field label='Description'>
            <textarea
              style={shared.textArea}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div style={shared.fieldGrid}>
            <Field label='Key'>
              <input
                style={{ ...shared.textInput, ...shared.mono }}
                value={key}
                maxLength={6}
                placeholder='From the title'
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              />
            </Field>
            <Field label='Due'>
              <input
                type='date'
                style={shared.textInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
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
  container: { gap: t.spacing.m, width: 'min(520px, 90vw)' },
}));
