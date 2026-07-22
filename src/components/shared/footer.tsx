import Link from "next/link";
import { Zap } from "lucide-react";
import { Container } from "@/components/marketing/container";

/**
 * Company/Legal columns intentionally render as plain (non-clickable)
 * text rather than links to pages that don't exist yet (About, Privacy
 * Policy, Terms of Service). Linking to a page with no real content, or
 * inventing legal text, would be misleading — these become real links
 * once that content actually exists.
 */
const productLinks = [
  { label: "Calculators", href: "/calculators" },
  { label: "Learn", href: "/learn" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "AI Tutor", href: "/tutor" },
];

const companyItems = ["About", "Contact"];
const resourceItems = ["Documentation", "FAQ", "Blog"];
const legalItems = ["Privacy Policy", "Terms of Service"];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-5 sm:mb-4">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <Zap className="size-5 text-primary" aria-hidden="true" />
            Elecora
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            An electrical engineering platform for students, engineers, and
            anyone learning how electricity works.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Product</h3>
          <ul className="flex flex-col gap-2">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Resources</h3>
          <ul className="flex flex-col gap-2">
            {resourceItems.map((item) => (
              <li key={item} className="text-sm text-muted-foreground/60">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="flex flex-col gap-2">
            {companyItems.map((item) => (
              <li key={item} className="text-sm text-muted-foreground/60">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Legal</h3>
          <ul className="flex flex-col gap-2">
            {legalItems.map((item) => (
              <li key={item} className="text-sm text-muted-foreground/60">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Elecora. Built for electrical
            engineering students and professionals.
          </p>
        </Container>
      </div>
    </footer>
  );
}
