import Image from 'next/image';
import type { TeamMember } from '@/payload/cms';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

type TeamMemberLike = TeamMember & {
  linkedinHref?: string;
  twitterHref?: string;
};

function readId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readPhoto(value: unknown): TeamMember['photo'] {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const url = readString(record.url);
  const alt = readString(record.alt);
  if (!url && !alt) return undefined;
  return { url, alt };
}

function resolveMember(
  value: unknown,
  memberById: ReadonlyMap<string, TeamMemberLike>,
): TeamMemberLike | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return memberById.get(String(value)) ?? null;
  }

  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = readId(record.id);
  const base = id ? memberById.get(id) : undefined;

  return {
    id: id || base?.id,
    name: readString(record.name) ?? base?.name,
    role: readString(record.role) ?? base?.role,
    bio: readString(record.bio) ?? base?.bio,
    photo: readPhoto(record.photo) ?? base?.photo,
    linkedinUrl:
      readString(record.linkedinUrl) ?? readString(record.linkedinHref) ?? base?.linkedinUrl,
    linkedinHref:
      readString(record.linkedinHref) ?? readString(record.linkedinUrl) ?? base?.linkedinHref,
    twitterUrl:
      readString(record.twitterUrl) ?? readString(record.twitterHref) ?? base?.twitterUrl,
    twitterHref:
      readString(record.twitterHref) ?? readString(record.twitterUrl) ?? base?.twitterHref,
    order: typeof record.order === 'number' ? record.order : base?.order,
  };
}

export default function TeamSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
  collections,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const selectedMembers = Array.isArray(sectionRecord.members)
    ? (sectionRecord.members as unknown[])
    : [];

  const memberById = new Map<string, TeamMemberLike>(
    (collections.teamMembers || [])
      .map((member) => {
        if (!member.id) return null;
        return [String(member.id), member as TeamMemberLike] as const;
      })
      .filter((entry): entry is readonly [string, TeamMemberLike] => !!entry),
  );

  const memberSource =
    selectedMembers.length > 0 ? selectedMembers : (collections.teamMembers as unknown[]);

  const members = memberSource
    .map((member) => resolveMember(member, memberById))
    .filter((member): member is TeamMemberLike => !!member);

  const colsMap: Record<string, string> = {
    '2': 'repeat(2, 1fr)',
    '3': 'repeat(3, 1fr)',
    '4': 'repeat(4, 1fr)',
  };
  const rawCols = typeof sectionRecord.columns === 'string' ? sectionRecord.columns : '3';
  const gridCols = colsMap[rawCols] ?? colsMap['3'];

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={sectionStyle}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      <div style={innerStyle}>
        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              textAlign: 'center',
              marginBottom: sectionRecord.subheading ? '8px' : '40px',
              color: resolvedHeadingColor,
              fontSize: hFontSize,
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        {sectionRecord.subheading ? (
          <p style={{ textAlign: 'center', marginBottom: '40px', color: resolvedMutedColor }}>
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '32px' }}>
          {members.map((member, memberIndex: number) => {
            const photoUrl = member.photo?.url || '';

            return (
              <div
                key={`${sectionKey}-member-${member.id || memberIndex}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {photoUrl ? (
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={photoUrl}
                      alt={member.photo?.alt || member.name || ''}
                      width={96}
                      height={96}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--ui-color-section-alt)',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ textAlign: 'center' }}>
                  {member.name ? (
                    <p style={{ fontWeight: 600, color: resolvedHeadingColor, margin: 0 }}>
                      {member.name}
                    </p>
                  ) : null}
                  {member.role ? (
                    <p style={{ fontSize: '14px', color: resolvedMutedColor, margin: '4px 0 0' }}>
                      {member.role}
                    </p>
                  ) : null}
                  {member.bio ? (
                    <p style={{ fontSize: '14px', color: resolvedBodyColor, marginTop: '8px' }}>
                      {member.bio}
                    </p>
                  ) : null}
                  <div
                    style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}
                  >
                    {member.linkedinUrl || member.linkedinHref ? (
                      <a
                        href={member.linkedinUrl || member.linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--ui-color-link)', fontSize: '13px' }}
                      >
                        LinkedIn
                      </a>
                    ) : null}
                    {member.twitterUrl || member.twitterHref ? (
                      <a
                        href={member.twitterUrl || member.twitterHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--ui-color-link)', fontSize: '13px' }}
                      >
                        Twitter
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
