import React from 'react';
import './admin.css';

export default function AdminDashboard() {
  return (
    <div className="container-admin-wapi">
      {/* Barra Lateral (Sidebar) */}
      <aside className="barra-lateral-wapi">
        <div className="logo-barra-lateral">
          <h2>WAPI</h2>
          <span>Water Control</span>
        </div>
        <ul className="menu-barra-lateral">
          <li className="ativo"><a href="#">📊 Dashboard Global</a></li>
          <li><a href="#">👥 Gestão de Usuários</a></li>
          <li><a href="#">💧 Reservatórios & Setores</a></li>
          <li><a href="#">⚠️ Central de Alertas</a></li>
          <li><a href="#">📈 Relatórios & Auditoria</a></li>
        </ul>
        <div className="rodape-barra-lateral">
          <p className="nome-usuario">Gustavo Ramalho</p>
          <p className="cargo-usuario">Administrador</p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="conteudo-principal-wapi">
        {/* Cabeçalho */}
        <header className="cabecalho-wapi">
          <div className="titulo-cabecalho">
            <h1>Painel Administrativo</h1>
            <p>Visão global do sistema e controle operacional</p>
          </div>
          <div className="acoes-cabecalho">
            <span className="selo-tema">🎨 Tema: Claro</span>
          </div>
        </header>

        {/* Área Dinâmica do Painel */}
        <div className="conteudo-dashboard">
          
          {/* Cards de KPIs */}
          <div className="grade-kpi">
            <div className="cartao-kpi">
              <div className="icone-kpi icone-azul">💧</div>
              <div className="info-kpi">
                <h3>Total Reservatórios</h3>
                <p className="valor-kpi">150</p>
                <span className="tendencia-kpi positivo">145 Ativos</span>
              </div>
            </div>

            <div className="cartao-kpi">
              <div className="icone-kpi icone-agua">👥</div>
              <div className="info-kpi">
                <h3>Clientes Ativos</h3>
                <p className="valor-kpi">88</p>
                <span className="tendencia-kpi positivo">+2 novos este mês</span>
              </div>
            </div>

            <div className="cartao-kpi">
              <div className="icone-kpi icone-laranja">⚠️</div>
              <div className="info-kpi">
                <h3>Alertas Ativos</h3>
                <p className="valor-kpi texto-critico">12</p>
                <span className="tendencia-kpi atencao">3 Críticos / 5 Atenção</span>
              </div>
            </div>

            <div className="cartao-kpi">
              <div className="icone-kpi icone-oceano">📊</div>
              <div className="info-kpi">
                <h3>Consumo Diário</h3>
                <p className="valor-kpi">4.500 m³</p>
                <span className="tendencia-kpi neutro">Dentro da baseline</span>
              </div>
            </div>
          </div>

          {/* Tabela de Gestão de Usuários */}
          <div className="cartao-container-tabela">
            <div className="cabecalho-cartao">
              <h2>Usuários e Contas do Sistema</h2>
              <button className="botao-primario">+ Novo Usuário</button>
            </div>
            <div className="tabela-responsiva">
              <table className="tabela-wapi">
                <thead>
                  <tr>
                    <th>Nome / Razão Social</th>
                    <th>E-mail</th>
                    <th>CPF / CNPJ</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fonte-seminegrito">Lucas Zangrande</td>
                    <td>lucas@watercontrol.com</td>
                    <td>123.456.789-00</td>
                    <td><span className="selo admin">Admin</span></td>
                    <td><span className="selo-status ativo">Ativo</span></td>
                    <td>
                      <button className="botao-acao" title="Editar">✏️</button>
                      <button className="botao-acao" title="Inativar">🚫</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="fonte-seminegrito">Nicolas Tavares</td>
                    <td>nicolas@watercontrol.com</td>
                    <td>987.654.321-11</td>
                    <td><span className="selo filiado">Filiado</span></td>
                    <td><span className="selo-status ativo">Ativo</span></td>
                    <td>
                      <button className="botao-acao" title="Editar">✏️</button>
                      <button className="botao-acao" title="Inativar">🚫</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}