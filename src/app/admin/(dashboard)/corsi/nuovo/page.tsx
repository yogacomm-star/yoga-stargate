import CourseForm from "@/components/admin/CourseForm";

export default function NuovoCorsoPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nuovo corso</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <CourseForm />
      </div>
    </div>
  );
}
