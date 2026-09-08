import { Suspense } from "react";
import { Wizard } from "./Wizard";

// Wizard reads URL search params (?prompt= &slides= &template=) for the
// landing-page composer hand-off, so it must run inside a Suspense boundary
// to keep prerendering happy.
export default function NewProjectPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Suspense fallback={null}>
        <Wizard />
      </Suspense>
    </div>
  );
}
