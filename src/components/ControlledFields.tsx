import { CSSProperties, HTMLInputTypeAttribute, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DateInput } from '~/components/DateInput';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { TextArea } from '~/components/TextArea';

/**
 * The panel's fields driven by `value` / `onChange` instead of a form — for
 * screens that save each field as it changes (a task panel, a row in a list).
 * They are the same components a form uses, so the two look alike; each keeps
 * a one-field form of its own and follows `value` when it changes outside.
 */

type Base = {
  label: string;
  description?: string;
  disabled?: boolean;
  style?: CSSProperties;
};

/** A one-field form whose value follows the prop, without re-mounting the field. */
const useValueForm = (value: string) => {
  const form = useForm<{ v: string }>({ defaultValues: { v: value } });
  useEffect(() => {
    if (form.getValues('v') !== value) form.setValue('v', value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return form;
};

type TextFieldProps = Base & {
  value: string;
  /** Every keystroke. */
  onChange?: (value: string) => void;
  /** Focus left the field: the moment a draft is usually saved. */
  onCommit?: (value: string) => void;
  onEnter?: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  transform?: (value: string) => string;
};

export const TextField = ({ value, onChange, onCommit, onEnter, ...p }: TextFieldProps) => {
  const form = useValueForm(value);
  return (
    <Input
      {...p}
      name='v'
      control={form.control}
      onValueChange={onChange}
      onBlur={onCommit ? () => onCommit(form.getValues('v')) : undefined}
      onEnter={onEnter ? () => onEnter(form.getValues('v')) : undefined}
    />
  );
};

type TextAreaFieldProps = Base & {
  value: string;
  onChange?: (value: string) => void;
  onCommit?: (value: string) => void;
  rows?: number;
  placeholder?: string;
};

export const TextAreaField = ({ value, onChange, onCommit, ...p }: TextAreaFieldProps) => {
  const form = useValueForm(value);
  return (
    <TextArea
      {...p}
      name='v'
      control={form.control}
      onValueChange={onChange}
      onBlur={onCommit ? () => onCommit(form.getValues('v')) : undefined}
    />
  );
};

type SelectFieldProps = Base & {
  value: string;
  options: { label: string; value: string; icon?: React.ComponentProps<typeof Select>['options'][number]['icon'] }[];
  onChange: (value: string) => void;
  /** Without the label above the value, for a compact row. */
  bare?: boolean;
};

export const SelectField = ({ value, onChange, bare, ...p }: SelectFieldProps) => {
  const form = useValueForm(value);
  return (
    <Select {...p} name='v' control={form.control} variant={bare ? 'secondary' : 'primary'} onValueChange={onChange} />
  );
};

type DateFieldProps = Base & {
  /** `YYYY-MM-DD`, or '' for none. */
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
};

export const DateField = ({ value, onChange, ...p }: DateFieldProps) => {
  const form = useValueForm(value);
  return <DateInput {...p} name='v' control={form.control} onValueChange={onChange} />;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Every quarter of an hour, as `HH:mm`. */
const QUARTERS = Array.from({ length: 96 }, (_, i) => `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`);

type DateTimeFieldProps = Omit<Base, 'label'> & {
  dateLabel: string;
  timeLabel?: string;
  /** An ISO timestamp, or null for none. */
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  /** The time a freshly picked day starts at. */
  defaultTime?: string;
};

/**
 * A moment in local time: the panel's date picker and a quarter-hour select,
 * instead of the browser's `datetime-local` with its mask. Clearing the day
 * clears the whole value.
 */
export const DateTimeField = ({
  dateLabel,
  timeLabel = 'Time',
  value,
  onChange,
  defaultTime = '09:00',
  disabled,
  description,
  style,
}: DateTimeFieldProps) => {
  const date = value ? new Date(value) : null;
  const day = date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '';
  const time = date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : defaultTime;
  const times = QUARTERS.includes(time) ? QUARTERS : [...QUARTERS, time].sort();

  const emit = (nextDay: string, nextTime: string) => {
    if (!nextDay) return onChange(null);
    const [y, m, d] = nextDay.split('-').map(Number);
    const [h, min] = nextTime.split(':').map(Number);
    onChange(new Date(y, m - 1, d, h, min).toISOString());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, minWidth: 0, ...style }}>
      <DateField
        label={dateLabel}
        description={description}
        disabled={disabled}
        style={{ flex: 3, minWidth: 0 }}
        value={day}
        onChange={(next) => emit(next, time)}
      />
      <SelectField
        label={timeLabel}
        disabled={disabled || !day}
        style={{ flex: 2, minWidth: 0 }}
        value={time}
        options={times.map((t) => ({ value: t, label: t }))}
        onChange={(next) => emit(day, next)}
      />
    </div>
  );
};
