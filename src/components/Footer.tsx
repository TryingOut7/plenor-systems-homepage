import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-primary-items">
          <span className="footer-brand">Plenor Systems</span>
          <a href="mailto:contact@plenor.ai" className="footer-link">
            contact@plenor.ai
          </a>
          <Link href="/privacy-policy" className="footer-link">
            Privacy Policy
          </Link>
        </div>
        <p className="footer-copyright">© {year} Plenor Systems. All rights reserved.</p>
      </div>
    </footer>
  );
}
