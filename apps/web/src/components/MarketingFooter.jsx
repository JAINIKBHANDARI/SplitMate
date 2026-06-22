import { ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
const linkStyle =
  "inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-violet";
export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-paper/72 px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2.5 font-extrabold tracking-[-.035em]"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-violet text-sm text-white">
                S
              </span>
              <span>SplitMate</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              The calm way to share money with the people in your life.
            </p>
            <a
              className={`${linkStyle} mt-4`}
              href="mailto:hello@splitmate.app?subject=SplitMate%20support"
            >
              <Mail className="size-4" />
              hello@splitmate.app
            </a>
          </div>
          <FooterColumn title="Product">
            <a className={linkStyle} href="/#features">
              Features
            </a>
            <a className={linkStyle} href="/#how-it-works">
              How it works
            </a>
            <Link className={linkStyle} to="/signup">
              Create account
            </Link>
            <Link className={linkStyle} to="/login">
              Sign in
            </Link>
          </FooterColumn>
          <FooterColumn title="Explore">
            <Link className={linkStyle} to="/app">
              Open SplitMate
            </Link>
            <a
              className={linkStyle}
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
            >
              API docs <ExternalLink className="size-3" />
            </a>
            <a
              className={linkStyle}
              href="/api/health"
              target="_blank"
              rel="noreferrer"
            >
              Service status <ExternalLink className="size-3" />
            </a>
            <a
              className={linkStyle}
              href="mailto:hello@splitmate.app?subject=SplitMate%20feedback"
            >
              Send feedback
            </a>
          </FooterColumn>
          <FooterColumn title="Legal">
            <Link className={linkStyle} to="/privacy">
              Privacy
            </Link>
            <Link className={linkStyle} to="/terms">
              Terms of use
            </Link>
            <a
              className={linkStyle}
              href="mailto:hello@splitmate.app?subject=Data%20request"
            >
              Data request
            </a>
          </FooterColumn>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SplitMate. Shared money, sorted.</p>
          <p>Built for friends, homes, and every plan in between.</p>
        </div>
      </div>
    </footer>
  );
}
function FooterColumn({ title, children }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-ink">{title}</h2>
      <div className="flex flex-col items-start gap-2.5">{children}</div>
    </div>
  );
}
