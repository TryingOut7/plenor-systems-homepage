import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | Plenor Systems' },
  description: 'Privacy information for the Plenor Systems website and inquiry form.',
  alternates: { canonical: 'https://www.plenor.ai/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | Plenor Systems',
    description: 'Privacy information for the Plenor Systems website and inquiry form.',
    url: 'https://www.plenor.ai/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section aria-labelledby="privacy-policy-heading" className="privacy-policy-section">
      <div className="privacy-policy-content">
        <h1 id="privacy-policy-heading">Privacy Policy</h1>
        <p className="privacy-effective-date">Effective date: August 6, 2026</p>

        <h2>Information we collect</h2>
        <p>Plenor Systems collects the information a visitor submits through the inquiry form: name, email address, company or organization where provided, the description of what the visitor is looking to build or define, and any additional context the visitor chooses to provide.</p>
        <p>The website and its hosting and security services may also process ordinary technical information needed to deliver, maintain, and protect the website, such as Internet Protocol address, browser and device information, request information, and server logs.</p>

        <h2>How we use information</h2>
        <p>Plenor Systems uses submitted information to review and respond to inquiries, communicate about requested information or services, operate and secure the website, troubleshoot technical issues, prevent misuse, and comply with applicable legal obligations.</p>

        <h2>Service providers</h2>
        <p>Plenor Systems may use service providers to host and secure the website and to process and deliver inquiry-form messages. Resend is used to deliver inquiry-form messages to contact@plenor.ai. Service providers process information only as needed to provide their services.</p>

        <h2>Cookies and analytics</h2>
        <p>The website does not use advertising cookies and does not currently use website analytics. Essential technical mechanisms may be used where needed to operate and secure the website.</p>

        <h2>Information sharing</h2>
        <p>Plenor Systems does not sell personal information. Information may be shared with service providers supporting website and communication operations or where disclosure is required by law.</p>

        <h2>Retention</h2>
        <p>Information is retained only for as long as reasonably necessary to respond to inquiries, maintain appropriate business records, operate and secure the website, comply with legal obligations, and resolve disputes.</p>

        <h2>Security</h2>
        <p>Plenor Systems uses reasonable administrative and technical measures intended to protect information. No method of transmission or storage can be guaranteed to be completely secure.</p>

        <h2>Privacy requests</h2>
        <p>A person may contact Plenor Systems to request access to, correction of, or deletion of personal information associated with an inquiry. Requests will be handled subject to applicable legal, record-retention, security, and operational requirements.</p>

        <h2>Children’s privacy</h2>
        <p>The website is not directed to children, and Plenor Systems does not knowingly collect personal information from children through the website.</p>

        <h2>Changes to this policy</h2>
        <p>This Privacy Policy may be updated when website practices or applicable requirements change. The current version will be published on this page.</p>

        <h2>Contact</h2>
        <p>Privacy questions or requests may be sent to contact@plenor.ai.</p>
      </div>
    </section>
  );
}
