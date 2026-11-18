import {
  complaintErrorMessage,
  emptyComplaintDraft,
  fetchComplaintCatalog,
  fileComplaint,
  type ComplaintCatalog,
  type ComplaintDraft,
  type FiledComplaint,
} from "@/api/complaintBook";
import { ComplaintBookForm } from "@/components/ComplaintBookForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function ComplaintBookPage() {
  const { isAuthenticated, user, getAuthToken } = useAuth();
  const [catalog, setCatalog] = useState<ComplaintCatalog | null>(null);
  const [draft, setDraft] = useState<ComplaintDraft>(emptyComplaintDraft);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filed, setFiled] = useState<FiledComplaint | null>(null);

  useEffect(() => {
    let active = true;
    fetchComplaintCatalog()
      .then((next) => {
        if (active) setCatalog(next);
      })
      .catch((reason) => {
        if (active) setError(complaintErrorMessage(reason, "No se pudo abrir el libro de reclamaciones."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const prefilled = useRef(false);

  useEffect(() => {
    if (prefilled.current || !isAuthenticated || !user) return;
    prefilled.current = true;
    setDraft((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [isAuthenticated, user]);

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      let token: string | undefined;
      if (isAuthenticated) {
        try {
          token = (await getAuthToken())?.token;
        } catch {
          token = undefined;
        }
      }
      const sheet = await fileComplaint(draft, token);
      setFiled(sheet);
    } catch (reason) {
      setError(complaintErrorMessage(reason, "No se pudo registrar la hoja."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <BookOpen className="h-6 w-6 text-primary" />
          Libro de reclamaciones
        </h1>
        <p className="text-muted-foreground">
          El número de hoja lo asigna el libro al registrar el envío.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3">Abriendo el libro...</span>
        </div>
      )}

      {!loading && filed && (
        <ComplaintFiled
          sheet={filed}
          onAnother={() => {
            setFiled(null);
            setError(null);
            setDraft({
              ...emptyComplaintDraft(),
              fullName: user?.name || "",
              email: user?.email || "",
            });
          }}
        />
      )}

      {!loading && !filed && catalog && (
        <ComplaintBookForm
          catalog={catalog}
          draft={draft}
          submitting={submitting}
          error={error}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onSubmit={onSubmit}
        />
      )}

      {!loading && !catalog && error && <p className="text-center text-destructive">{error}</p>}
    </main>
  );
}

function formatFiledAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function ComplaintFiled({ sheet, onAnother }: { sheet: FiledComplaint; onAnother: () => void }) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Hoja registrada</h2>
      <p className="text-muted-foreground">
        {sheet.consumerName} · {sheet.kindLabel} · {sheet.statusLabel}
      </p>
      <p className="text-3xl font-bold text-primary">N.° {sheet.sheetNumber}</p>
      <p className="text-sm text-muted-foreground">{formatFiledAt(sheet.filedAt)}</p>
      <p className="text-sm text-muted-foreground">
        Conserva este número. La hoja queda en el libro del establecimiento.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onAnother}>
          Registrar otra hoja
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </section>
  );
}
