type MigrationReportItem = {
  id?: string | number;
  slug?: string;
  status?: string;
};

type MigrationReport = {
  unresolvedParityFailures?: number;
  items?: MigrationReportItem[];
};

export type LegacyCutoverEvaluation = {
  ready: boolean;
  unresolvedParityFailures: number;
  unresolvedItems: MigrationReportItem[];
  blockers: string[];
};

export function evaluateLegacyCutoverReport(
  report: MigrationReport,
): LegacyCutoverEvaluation {
  const unresolvedParityFailures = Number(report.unresolvedParityFailures || 0);
  const items = Array.isArray(report.items) ? report.items : [];
  const unresolvedItems = items.filter((item) => item.status === 'needs_manual_review');

  const blockers: string[] = [];
  if (unresolvedParityFailures > 0) {
    blockers.push(
      `unresolvedParityFailures=${unresolvedParityFailures} must be 0 before legacy removal.`,
    );
  }
  if (unresolvedItems.length > 0) {
    blockers.push(
      `${unresolvedItems.length} document(s) still marked needs_manual_review.`,
    );
  }

  return {
    ready: blockers.length === 0,
    unresolvedParityFailures,
    unresolvedItems,
    blockers,
  };
}
