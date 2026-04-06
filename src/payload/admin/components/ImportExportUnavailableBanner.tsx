'use client';

/**
 * ImportExportUnavailableBanner
 *
 * Shown in the Payload admin list view for collections that support Import/Export
 * when the feature is disabled at runtime (missing BLOB_READ_WRITE_TOKEN or not
 * running on Vercel).
 *
 * Without this banner an admin who navigates to e.g. Service Items has no
 * indication that the export button does not exist — the UI simply looks like a
 * normal collection list. The banner surfaces the root cause and the exact step
 * required to restore the feature.
 *
 * This component is registered via `admin.components.beforeList` on each
 * affected collection when `!(process.env.VERCEL && hasBlobReadWriteToken)`.
 * It is NOT registered when the plugin is active — in that case Payload renders
 * the native Import/Export controls and this banner is never mounted.
 */

const ImportExportUnavailableBanner = () => {
  return (
    <div
      style={{
        background: '#FFFBEB',
        border: '1px solid #F59E0B',
        borderRadius: '6px',
        padding: '10px 14px',
        marginBottom: '16px',
        fontSize: '13px',
        color: '#92400E',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
      <span>
        <strong>Import/Export is not available</strong> in this environment.
        {' '}This feature requires the{' '}
        <code
          style={{
            background: 'rgba(0,0,0,0.06)',
            padding: '1px 4px',
            borderRadius: '3px',
            fontSize: '12px',
          }}
        >
          BLOB_READ_WRITE_TOKEN
        </code>
        {' '}environment variable to be set and the deployment to be running on Vercel.
        {' '}Set this token in your Vercel project settings under{' '}
        <strong>Storage → Blob → Token</strong> and redeploy to enable it.
      </span>
    </div>
  );
};

export default ImportExportUnavailableBanner;
