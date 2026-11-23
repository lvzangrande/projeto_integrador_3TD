import "./card_filiado.css"
export default function CardAfiliado({ funcaoCard, imgFuncao, descricao, link }) {
    return(
        <div className="card">
            <a href={link}>
                <img src={`/${imgFuncao}`} alt={funcaoCard} width="400" />
                <h2>{funcaoCard}</h2>
                <p>{descricao}</p>
            </a>
        </div>
    )
}
