import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { FileUp, LoaderCircle } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export function SupportFileInput({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = trpc.files.uploadSupport.useMutation({ onSuccess: result => { onUploaded(result.url); toast.success("Soporte cargado en almacenamiento seguro."); }, onError: error => toast.error(error.message) });
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > 5_000_000) { toast.error("Adjunta PDF, JPG, PNG o WEBP de máximo 5 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { const base64 = String(reader.result).split(",")[1]; if (base64) upload.mutate({ fileName: file.name, contentType: file.type as "application/pdf" | "image/jpeg" | "image/png" | "image/webp", base64 }); };
    reader.readAsDataURL(file);
  };
  return <div className="flex items-center gap-2"><input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} /><Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => inputRef.current?.click()} className="rounded-lg border-emerald-700 text-emerald-800 hover:bg-emerald-50">{upload.isPending ? <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" /> : <FileUp className="mr-1 h-3.5 w-3.5" />}{upload.isPending ? "Cargando…" : "Cargar soporte"}</Button></div>;
}
