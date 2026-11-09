"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClienteForm from "@/components/Form/Clienteform";

export default function CadastrarCliente() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState(null);

  const cadastrar = async (dados) => {
    setEnviando(true);
    setErroEnvio(null);

    try {
      const res = await fetch("/api/clientes", {      // ajuste ao seu endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),                   // ajuste os nomes dos campos, se preciso
      });

      if (!res.ok) {
        const corpo = await res.json().catch(() => ({}));
        throw new Error(corpo.mensagem || "Não foi possível cadastrar o cliente.");
      }

      router.push("/clientes");                        // ajuste o destino
    } catch (e) {
      setErroEnvio(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ClienteForm
      onSubmit={cadastrar}
      onCancel={() => router.back()}
      enviando={enviando}
      erroEnvio={erroEnvio}
    />
  );
}