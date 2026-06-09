import { CSSProperties } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  height?: number;
  preview?: 'edit' | 'live' | 'preview';
  placeholder?: string;
  style?: CSSProperties;
};

/** Dark-themed rich markdown editor (toolbar + live preview), emits plain markdown. */
export const MarkdownEditor = ({
  value,
  onChange,
  onBlur,
  height = 240,
  preview = 'live',
  placeholder,
  style,
}: MarkdownEditorProps) => (
  <div data-color-mode='dark' onBlur={onBlur} style={style}>
    <MDEditor
      value={value}
      onChange={(v) => onChange(v ?? '')}
      height={height}
      preview={preview}
      textareaProps={{ placeholder }}
      visibleDragbar
    />
  </div>
);
