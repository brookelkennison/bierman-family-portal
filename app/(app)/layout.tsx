import { AppHeader } from "@/components/shell/AppHeader";
import { MobileNav } from "@/components/shell/MobileNav";
import { SkipLink } from "@/components/shell/SkipLink";
import { getCurrentParent } from "@/lib/auth";

/** Shell for every logged-in page. The (app) folder name isn't in the URL. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const parent = await getCurrentParent();
  return (
    <>
      <SkipLink />
      <AppHeader parent={parent} />
      <MobileNav />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-page flex-1 px-5 py-7 outline-none lg:px-12 lg:py-8"
      >
        {children}
      </main>
    </>
  );
}
