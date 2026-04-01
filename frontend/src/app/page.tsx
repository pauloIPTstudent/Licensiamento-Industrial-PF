'use client';
import { useState } from "react";
import Flow from "./flow";
import Questionnaire from "./Questionnaire"; // Correto: O "./" indica arquivo local

export default function Home() {
  const [fluxoFinal, setFluxoFinal] = useState<any[] | null>(null);

  // Esta função será passada para o Flow para capturar o JSON
  const aoFinalizarFluxo = (json: any[]) => {
    setFluxoFinal(json);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {!fluxoFinal ? (
        // Passamos a função de captura para dentro do Flow
        <Flow onExport={aoFinalizarFluxo} />
      ) : (
        <div className="w-full">
            <button 
                onClick={() => setFluxoFinal(null)}
                className="fixed top-4 left-4 bg-gray-200 p-2 rounded hover:bg-gray-300 z-50 text-black text-xs"
            >
                ← Voltar ao Editor
            </button>
            <Questionnaire fluxData={fluxoFinal} />
        </div>
      )}
    </main>
  );
}