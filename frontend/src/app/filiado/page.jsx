import CardAfiliado from "@/components/card_filiado/card_filiado.jsx"
import { cards } from "@/components/card_filiado/cardsAfiliado.jsx"

import "./filiado.css"

export default function filiado() {
    return(
        <>
            <h1>Página afiliado</h1>
            <div className="Card">
            { cards.map((card) => (
            <CardAfiliado key={card.link} {...card}/>
            ))}
            </div>
        </>
    )
}