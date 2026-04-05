import type { CSSProperties, ReactNode } from 'react';
import type { HeadingTag } from '../types';

interface SectionHeadingProps {
  tag?: HeadingTag;
  fontSize?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function SectionHeading({
  tag = 'h2',
  fontSize,
  style,
  children,
}: SectionHeadingProps) {
  const Tag = tag;
  const mergedStyle: CSSProperties = {
    ...style,
    ...(fontSize ? { fontSize } : {}),
  };

  return <Tag style={mergedStyle}>{children}</Tag>;
}
