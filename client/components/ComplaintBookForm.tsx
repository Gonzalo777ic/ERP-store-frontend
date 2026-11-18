import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ComplaintCatalog, ComplaintDraft, DocumentOption } from "@/api/complaintBook";
import { FormEvent, type ReactNode } from "react";

interface ComplaintBookFormProps {
  catalog: ComplaintCatalog;
  draft: ComplaintDraft;
  submitting: boolean;
  error: string | null;
  onChange: (patch: Partial<ComplaintDraft>) => void;
  onSubmit: () => void;
}

export function ComplaintBookForm({ catalog, draft, submitting, error, onChange, onSubmit }: ComplaintBookFormProps) {
  const documentHint = lengthHint(catalog.documentTypes, draft.documentType);
  const guardianHint = lengthHint(catalog.documentTypes, draft.guardianDocumentType);
  const selectedKind = catalog.kinds.find((kind) => kind.code === draft.kind);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className="space-y-8 rounded-lg border border-border bg-card p-6 shadow-sm">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Consumidor</h2>
        <Field label="Nombres y apellidos">
          <Input value={draft.fullName} onChange={(event) => onChange({ fullName: event.target.value })} required />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Documento">
            <OptionSelect
              value={draft.documentType}
              placeholder="Tipo de documento"
              options={catalog.documentTypes}
              onChange={(documentType) => onChange({ documentType })}
            />
          </Field>
          <Field label="Número de documento" hint={documentHint}>
            <Input value={draft.documentNumber} onChange={(event) => onChange({ documentNumber: event.target.value })} required />
          </Field>
        </div>
        <Field label="Domicilio">
          <Input value={draft.address} onChange={(event) => onChange({ address: event.target.value })} required />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Teléfono">
            <Input value={draft.phone} onChange={(event) => onChange({ phone: event.target.value })} required />
          </Field>
          <Field label="Correo">
            <Input type="email" value={draft.email} onChange={(event) => onChange({ email: event.target.value })} required />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="complaint-minor"
            checked={draft.minor}
            onCheckedChange={(checked) => onChange({ minor: checked === true })}
          />
          <Label htmlFor="complaint-minor">El consumidor es menor de edad</Label>
        </div>
        {draft.minor && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Padre, madre o apoderado">
              <Input value={draft.guardianName} onChange={(event) => onChange({ guardianName: event.target.value })} required />
            </Field>
            <Field label="Documento del apoderado">
              <OptionSelect
                value={draft.guardianDocumentType}
                placeholder="Tipo de documento"
                options={catalog.documentTypes}
                onChange={(guardianDocumentType) => onChange({ guardianDocumentType })}
              />
            </Field>
            <Field label="Número del apoderado" hint={guardianHint}>
              <Input
                value={draft.guardianDocumentNumber}
                onChange={(event) => onChange({ guardianDocumentNumber: event.target.value })}
                required
              />
            </Field>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Reclamo</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {catalog.kinds.map((kind) => (
            <li key={kind.code}>
              <span className="font-semibold text-foreground">{kind.label}.</span> {kind.description}
            </li>
          ))}
        </ul>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipo" hint={selectedKind?.description}>
            <OptionSelect
              value={draft.kind}
              placeholder="Reclamo o queja"
              options={catalog.kinds}
              onChange={(kind) => onChange({ kind })}
            />
          </Field>
          <Field label="Bien o servicio">
            <OptionSelect
              value={draft.subjectKind}
              placeholder="Bien o servicio"
              options={catalog.subjectKinds}
              onChange={(subjectKind) => onChange({ subjectKind })}
            />
          </Field>
        </div>
        <Field label="Descripción del bien o servicio">
          <Input
            value={draft.subjectDescription}
            onChange={(event) => onChange({ subjectDescription: event.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Monto, si aplica">
            <Input
              inputMode="decimal"
              value={draft.claimedAmount}
              onChange={(event) => onChange({ claimedAmount: event.target.value })}
              placeholder="0.00"
            />
          </Field>
          <Field label="Pedido o comprobante, si aplica">
            <Input value={draft.orderReference} onChange={(event) => onChange({ orderReference: event.target.value })} />
          </Field>
        </div>
        <Field label="Detalle">
          <Textarea value={draft.detail} onChange={(event) => onChange({ detail: event.target.value })} required />
        </Field>
        <Field label="Pedido del consumidor">
          <Textarea
            value={draft.consumerRequest}
            onChange={(event) => onChange({ consumerRequest: event.target.value })}
            required
          />
        </Field>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="shadow-md">
        {submitting ? "Enviando hoja..." : "Enviar hoja"}
      </Button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function OptionSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: { code: string; label: string }[];
  onChange: (code: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function lengthHint(options: DocumentOption[], code: string): string | undefined {
  const selected = options.find((option) => option.code === code);
  if (!selected) {
    return undefined;
  }
  if (selected.minLength === selected.maxLength) {
    return `${selected.minLength} caracteres`;
  }
  return `${selected.minLength} a ${selected.maxLength} caracteres`;
}
