import { Suspense } from "react";
import ShareLanding from "@/components/ShareLanding";

export const dynamic = "force-dynamic";

/**
 * Web Share Target landing page.
 *
 * Android (and increasingly desktop Chromium) routes a "Share to ZAI@n"
 * action to /share?title=…&text=…&url=… per the manifest's `share_target`
 * declaration. We hand the params to a client component that pre-loads
 * the workspace with the shared text.
 */
export default function SharePage() {
  return (
    <Suspense fallback={null}>
      <ShareLanding />
    </Suspense>
  );
}
