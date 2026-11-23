import Link from "next/link";
import Filitable from "@/components/Tabelas/filitable";

export default function HistoricoLeituras() {
  return <main><p style={{ maxWidth: 1500, margin: "20px auto 0", padding: "0 20px" }}><Link href="/filiado">← Voltar ao painel</Link></p><Filitable /></main>;
}
