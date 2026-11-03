import "./card_filiado.css"
export default function CardAfiliado({ funcaoCard, imgFuncao, descricao, link }) {
    return(
        <div className="card">
            <a href={link}>
                <img src={`/${imgFuncao}`} alt={funcaoCard} width="400" />
                <h1>{funcaoCard}</h1>
                <p>{descricao}</p>
            </a>
        </div>
    )
}