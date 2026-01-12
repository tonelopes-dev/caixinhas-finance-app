"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { InlineLoading } from "@/components/ui/loading-screen";

function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Aguardar o status ser definitivo antes de redirecionar
    if (status === "loading") return;

    // Redireciona com base no status da autenticação
    if (status === "unauthenticated") {
      router.replace("/landing");
    } else if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Enquanto a sessão está sendo verificada, mostramos um loader.
  return (
    <div className="flex items-center justify-center p-4 border rounded-lg">
      <InlineLoading size="lg" message="Grande" />
    </div>
  );
}

export default HomePage;
