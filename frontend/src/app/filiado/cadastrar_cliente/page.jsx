"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import ClienteForm from "@/components/Form/Clienteform";
import { apiRequest } from "@/lib/api";
import "./cadastrar_cliente.css";

export default function CadastrarCliente() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState(null);

  const cadastrar = async (dados) => {
    setEnviando(true);
    setErroEnvio(null);

    try {
      await apiRequest("/usuario", {
        method: "POST",
        body: JSON.stringify(dados),
      });
      router.refresh();
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
