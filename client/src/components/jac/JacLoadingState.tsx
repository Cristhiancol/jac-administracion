import { Skeleton } from "@/components/ui/skeleton";

export function JacLoadingState({ label = "Cargando información institucional" }: { label?: string }) {
  return <section aria-busy="true" aria-live="polite" className="grid gap-5"><span className="sr-only">{label}</span><Skeleton className="h-9 w-52 rounded-lg" /><Skeleton className="h-28 w-full rounded-3xl" /><div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map(item => <Skeleton key={item} className="h-32 rounded-2xl" />)}</div><Skeleton className="h-72 w-full rounded-3xl" /></section>;
}
