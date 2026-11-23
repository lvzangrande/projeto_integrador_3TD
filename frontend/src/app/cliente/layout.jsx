import ClienteShell from "./ClienteShell";
import "./cliente.css";

export default function ClienteLayout({ children }) {
  return <ClienteShell>{children}</ClienteShell>;
}
