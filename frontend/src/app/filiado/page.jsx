import CardAfiliado from "@/components/card_filiado/card_filiado.jsx";
import { cards } from "@/components/card_filiado/cardsAfiliado.jsx";
import "./filiado.css";

export default function Filiado() {
  return (
    <main className="affiliate-home">
      <section className="Card" aria-label="Atalhos da área do afiliado">
        {cards.map((card) => <CardAfiliado key={card.link} {...card} />)}
      </section>
    </main>
  );
}