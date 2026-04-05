import React from 'react';
import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

interface RichTextProps {
  data: SerializedEditorState | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}

export default function RichText({ data, className, style }: RichTextProps) {
  if (!data) return null;
  return (
    <div className={className} style={style}>
      <PayloadRichText data={data} />
    </div>
  );
}
