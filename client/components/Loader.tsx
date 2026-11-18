import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <img src="/valeerp-mark.png" alt="" className="h-14 w-14 rounded-lg" />
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
    </div>
  );
}
