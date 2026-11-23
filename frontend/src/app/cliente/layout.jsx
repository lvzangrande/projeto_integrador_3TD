import ClientShell from "./ClientShell";
import "../filiado/affiliate.css";
import "./cliente.css";
export default function ClientLayout({ children }) {
  return <ClientShell>{children}</ClientShell>;
}
