import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nytt klientföretag</h1>
        <p className="text-gray-500 text-sm mt-1">Fyll i uppgifterna för det företag du fakturerar för.</p>
      </div>
      <ClientForm />
    </div>
  );
}
