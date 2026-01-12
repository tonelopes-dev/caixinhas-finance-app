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
    <div className="min-h-screen flex items-center justify-center">
      <InlineLoading size="lg" message="Carregando..." />
    </div>
  );
}

export default HomePage;
