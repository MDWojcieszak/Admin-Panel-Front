import { CSSProperties } from 'react';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '~/components/MarkdownEditor.css';
import { useTheme } from '~/utils/theme';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  height?: number;
  preview?: 'edit' | 'live' | 'preview';
  placeholder?: string;
  /** Drops the editor's own edit / live / preview / fullscreen buttons, for screens with their own switch. */
  hideModeSwitch?: boolean;
  style?: CSSProperties;
};

/** What prose like a notice needs; images, tables and code blocks only clutter the bar. */
const TOOLBAR: ICommand[] = [
  commands.title,
  commands.bold,
  commands.italic,
  commands.divider,
  commands.link,
  commands.quote,
  commands.divider,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.hr,
];

/** Markdown editor in the app's own look (see MarkdownEditor.css), emits plain markdown. */
export const MarkdownEditor = ({
  value,
  onChange,
  onBlur,
  height = 240,
  preview = 'live',
  placeholder,
  hideModeSwitch,
  style,
}: MarkdownEditorProps) => {
  const theme = useTheme();
  // Theme colours handed to the stylesheet, which cannot read the theme itself.
  const vars = {
    '--app-md-bg': theme.colors.gray02 + theme.colorOpacity(0.6),
    '--app-md-border': theme.colors.white + theme.colorOpacity(0.06),
    '--app-md-fg': theme.colors.white,
    '--app-md-muted': theme.colors.dark05,
    '--app-md-accent': theme.colors.blue04,
    '--app-md-focus': theme.colors.blue + theme.colorOpacity(0.5),
    '--app-md-hover': theme.colors.white + theme.colorOpacity(0.08),
    '--app-md-radius': `${theme.borderRadius.default}px`,
  } as CSSProperties;

  return (
    <div data-color-mode='dark' className='app-md-editor' onBlur={onBlur} style={{ ...vars, ...style }}>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview={preview}
        commands={TOOLBAR}
        extraCommands={hideModeSwitch ? [] : undefined}
        textareaProps={{ placeholder }}
        visibleDragbar={false}
      />
    </div>
  );
};
