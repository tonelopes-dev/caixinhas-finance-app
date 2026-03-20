import { withPageAccess } from '@/lib/page-access';
import { ReportsPageClient } from '@/components/reports/reports-page-client';

export default async function ReportsPage() {
  await withPageAccess({ requireFullAccess: true });

  return (
    <div className="pt-8 text-[#2D241E]">
      <div className="mx-auto w-full max-w-7xl">
        <ReportsPageClient />
      </div>
    </div>
  );
}