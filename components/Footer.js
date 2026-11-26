export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__status">
          <span className="dot" />
          All sections passing · 0 bugs found on this page (so far)
        </p>
        <p>© {new Date().getFullYear()} Protiti Sahajee Prachi</p>
        <a href="#hero" className="footer__top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
