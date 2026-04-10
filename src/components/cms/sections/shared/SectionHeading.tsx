import type { CSSProperties, HTMLAttributes } from 'react';
import type { HeadingTag } from '../types';

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  tag?: HeadingTag;
  fontSize?: string;
}

export default function SectionHeading({
  tag = 'h2',
  fontSize,
  style,
  children,
  ...rest
}: SectionHeadingProps) {
  const Tag = tag;
  const mergedStyle: CSSProperties = {
    fontFamily: 'var(--ui-font-body)',
    ...style,
    ...(fontSize ? { fontSize } : {}),
  };

  return (
    <Tag {...rest} style={mergedStyle}>
      {children}
    </Tag>
  );
}
