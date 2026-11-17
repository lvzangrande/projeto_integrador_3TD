"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import ClienteForm from "@/components/Form/Clienteform";
import "./cadastrar_cliente.css";

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

      router.push("/filiado/clientes");
    } catch (e) {
      setErroEnvio(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="affiliate-register-page">
    <div className="affiliate-back"><BotaoVoltar/></div>

    <ClienteForm
      onSubmit={cadastrar}
      enviando={enviando}
      erroEnvio={erroEnvio}
    />
    </main>
  );
}
