"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import ModalCadastro from "@/components/Form/ModalCadastro.jsx";
import { IconCalendarCheck, IconClock, IconMic, IconRecord, IconStop, IconFileText, IconNote, IconListCheck, IconCheck } from "@/components/Form/Iconesregistrarreunião.jsx";
import "@/components/Form/formbase.css";
import { apiRequest } from "@/lib/api";
import "./registrar_reuniao.css";

export default function RegistrarReuniao() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState("Reunião");
  const [dataHora, setDataHora] = useState(() => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    return agora.toISOString().slice(0, 16);
  });
  const [gravando, setGravando] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    apiRequest("/usuario")
      .then((dados) => { if (ativo) setClientes(Array.isArray(dados) ? dados : []); })
      .catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregandoClientes(false); });
    return () => { ativo = false; };
  }, []);

  const alternarGravacao = async () => {
    if (gravando) {
      window.mediaRecorder?.stop();
      setGravando(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setErro("Este navegador não permite gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const partes = [];
      recorder.ondataavailable = (evento) => evento.data.size && partes.push(evento.data);
      recorder.onstop = () => {
        setArquivo(new File(partes, `gravacao-${Date.now()}.webm`, { type: recorder.mimeType }));
        stream.getTracks().forEach((track) => track.stop());
      };
      window.mediaRecorder = recorder;
      recorder.start();
      setErro("");
      setGravando(true);
    } catch {
      setErro("Não foi possível acessar o microfone. Verifique a permissão do navegador.");
    }
  };

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErro("");
    setEnviando(true);
    const form = new FormData(evento.currentTarget);

    try {
      await apiRequest("/reunioes", {
        method: "POST",
        body: JSON.stringify({
          id_usuario: Number(clienteId),
          momento_abertura: dataHora,
          pauta: form.get("pauta"),
          resumo: form.get("resumo"),
          proximos_passos: form.get("proximosPassos") || null,
          tipo,
        }),
      });
      router.push("/filiado/historico_reunioes");
      router.refresh();
    } catch (error) {
      setErro(error.message || "Não foi possível salvar o encontro.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="rr-page">
      <div className="rr-back"><BotaoVoltar /></div>
      <ModalCadastro
        icone={IconCalendarCheck}
        titulo="Registro de reunião ou entrevista"
        subtitulo="Documente os encontros vinculados a um cliente da sua carteira."
        rodape={<>
          {erro && <p className="cf-erro-envio" role="alert">{erro}</p>}
          <button type="submit" form="registro-reuniao" className="cf-btn cf-btn--pri" disabled={enviando || carregandoClientes || clientes.length === 0}>
            <IconCheck size={18} />{enviando ? "Salvando..." : "Registrar encontro"}
          </button>
        </>}
      >
        {!carregandoClientes && !erro && clientes.length === 0 && (
          <p className="cf-erro-envio" role="status">
            Cadastre um cliente antes de registrar um encontro. <Link className="rr-toggle-cliente" href="/filiado/cadastrar_cliente">Cadastrar cliente</Link>
          </p>
        )}
        <form id="registro-reuniao" onSubmit={enviar} className="rr-form">
          <div className="rr-topo">
            <label className="rr-field">
              <span>Cliente</span>
              <span className="rr-select"><IconNote size={18} />
                <select name="clienteId" required value={clienteId} onChange={(evento) => setClienteId(evento.target.value)}>
                  <option value="" disabled>{carregandoClientes ? "Carregando clientes..." : "Selecione um cliente da sua carteira"}</option>
                  {clientes.map((cliente) => <option key={cliente.id_usuario} value={cliente.id_usuario}>{cliente.nome}</option>)}
                </select>
              </span>
            </label>
            <fieldset className="rr-tipo"><legend>Tipo de registro</legend>{[["Reunião", "Reunião"], ["Entrevista", "Entrevista"]].map(([valor, nome]) => <label className="cf-radio" key={valor}><input type="radio" name="tipo" checked={tipo === valor} onChange={() => setTipo(valor)} /><span className="cf-radio__marca" />{nome}</label>)}</fieldset>
            <label className="rr-field rr-data"><span>Data e horário</span><span className="rr-input"><IconClock size={18} /><input aria-label="Data e horário" type="datetime-local" required value={dataHora} onChange={(evento) => setDataHora(evento.target.value)} /></span></label>
          </div>

          <section className="rr-audio" aria-label="Gravação de áudio">
            <span className="rr-mic"><IconMic size={22} /></span>
            <div className="rr-audio-copy"><strong>Gravação de áudio <small>OPCIONAL</small></strong><span>Prévia local do áudio. O arquivo não é enviado nem armazenado no histórico.</span></div>
            <span className={`rr-status ${gravando ? "is-recording" : ""}`}><i />{gravando ? "Gravando" : arquivo ? "Áudio gravado" : "Pronto para gravar"}</span>
            <button type="button" className="rr-record" onClick={alternarGravacao}>{gravando ? <IconStop size={17} /> : <IconRecord size={17} />}{gravando ? "Parar gravação" : "Iniciar gravação"}</button>
            {arquivo && <audio className="rr-playback" controls src={URL.createObjectURL(arquivo)} />}
          </section>

          <div className="rr-textos">
            <label className="rr-field"><span>Pauta</span><span className="rr-area"><IconFileText size={17} /><textarea name="pauta" required placeholder="Descreva os principais assuntos abordados no encontro..." /></span></label>
            <label className="rr-field"><span>Resumo e decisões</span><span className="rr-area"><IconNote size={17} /><textarea name="resumo" required placeholder="Registre os principais pontos discutidos e as decisões tomadas..." /></span></label>
            <label className="rr-field rr-proximos"><span>Próximos passos <small>(opcional)</small></span><span className="rr-area"><IconListCheck size={17} /><textarea name="proximosPassos" placeholder="Descreva as ações combinadas, responsáveis ou datas de acompanhamento..." /></span></label>
          </div>
        </form>
      </ModalCadastro>
    </main>
  );
}
