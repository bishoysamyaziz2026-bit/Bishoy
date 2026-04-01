import SovereignLayout from "@/components/SovereignLayout";

export default function SystemControlPage() {
  return (
    <SovereignLayout activeId="system-control">
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-foreground">التحكم في النظام</h1>
        <p className="text-muted-foreground">هذه الصفحة مخصصة للمالك فقط.</p>
      </div>
    </SovereignLayout>
  );
}