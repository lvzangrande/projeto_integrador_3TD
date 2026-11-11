"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalCadastro from "@/components/Form/ModalCadastro.jsx";
import { IconCalendarCheck, IconClock, IconMic, IconRecord, IconStop, IconFileText, IconNote, IconListCheck, IconX, IconCheck } from "@/components/Form/Iconesregistrarreunião.jsx";
import "@/components/Form/formbase.css";
import "./registrar_reuniao.css";

export default function RegistrarReuniao() {
  const router = useRouter();
  const [tipo, setTipo] = useState("reuniao");
  const [clienteManual, setClienteManual] = useState(false);
  const [dataHora, setDataHora] = useState("");
  const [gravando, setGravando] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    setDataHora(agora.toISOString().slice(0, 16));
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
      recorder.ondataavailable = (event) => event.data.size && partes.push(event.data);
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

  const enviar = (event) => {
    event.preventDefault();
    setErro("O formulário está pronto, mas o projeto ainda não possui uma API para salvar reuniões.");
  };

  return (
    <main className="rr-page">
      <ModalCadastro
        icone={IconCalendarCheck}
        titulo="Registro de reunião ou entrevista"
        subtitulo="Documente os encontros e acompanhe os próximos passos com seus clientes."
        rodape={<>
          {erro && <p className="cf-erro-envio" role="alert">{erro}</p>}
          <button type="button" className="cf-btn cf-btn--sec" onClick={() => router.back()}><IconX size={18} /> Cancelar</button>
          <button type="submit" form="registro-reuniao" className="cf-btn cf-btn--pri"><IconCheck size={18} /> Registrar encontro</button>
        </>}
      >
        <form id="registro-reuniao" onSubmit={enviar} className="rr-form">
          <div className="rr-topo">
            <div className="rr-field">
              <div className="rr-cliente-heading"><span>Cliente</span><button type="button" className="rr-toggle-cliente" onClick={() => setClienteManual((atual) => !atual)}>{clienteManual ? "Selecionar cliente cadastrado" : "Digitar nome"}</button></div>
              {clienteManual ? (
                <span className="rr-input"><IconNote size={18} /><input name="clienteNome" type="text" required placeholder="Digite o nome do cliente" autoComplete="name" /></span>
              ) : (
                <span className="rr-select"><IconNote size={18} /><select name="clienteId" required defaultValue=""><option value="" disabled>Selecione um cliente da sua carteira</option></select></span>
              )}
            </div>
            <fieldset className="rr-tipo"><legend>Tipo de registro</legend>{[["reuniao", "Reunião"], ["entrevista", "Entrevista"]].map(([valor, nome]) => <label className="cf-radio" key={valor}><input type="radio" name="tipo" checked={tipo === valor} onChange={() => setTipo(valor)} /><span className="cf-radio__marca" />{nome}</label>)}</fieldset>
            <label className="rr-field rr-data"><span>Data e horário</span><span className="rr-input"><IconClock size={18} /><input aria-label="Data e horário" type="datetime-local" required value={dataHora} onChange={(e) => setDataHora(e.target.value)} /></span></label>
          </div>

          <section className="rr-audio" aria-label="Gravação de áudio">
            <span className="rr-mic"><IconMic size={22} /></span>
            <div className="rr-audio-copy"><strong>Gravação de áudio <small>OPCIONAL</small></strong><span>Grave o encontro para complementar as informações escritas abaixo. O áudio ficará vinculado a este registro.</span></div>
            <span className={`rr-status ${gravando ? "is-recording" : ""}`}><i />{gravando ? "Gravando" : arquivo ? "Áudio gravado" : "Pronto para gravar"}</span>
            <button type="button" className="rr-record" onClick={alternarGravacao}>{gravando ? <IconStop size={17} /> : <IconRecord size={17} />}{gravando ? "Parar gravação" : "Iniciar gravação"}</button>
            {arquivo && <audio className="rr-playback" controls src={URL.createObjectURL(arquivo)} />}
          </section>

          <div className="rr-textos">
            <label className="rr-field"><span>Pauta</span><span className="rr-area"><IconFileText size={17} /><textarea required placeholder="Descreva os principais assuntos abordados no encontro..." /></span></label>
            <label className="rr-field"><span>Resumo e decisões</span><span className="rr-area"><IconNote size={17} /><textarea required placeholder="Registre os principais pontos discutidos e as decisões tomadas..." /></span></label>
            <label className="rr-field rr-proximos"><span>Próximos passos <small>(opcional)</small></span><span className="rr-area"><IconListCheck size={17} /><textarea placeholder="Descreva as ações combinadas, responsáveis ou datas de acompanhamento..." /></span></label>
          </div>
        </form>
      </ModalCadastro>
    </main>
  );
}
