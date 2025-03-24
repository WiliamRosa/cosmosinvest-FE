import React, { useState, useEffect } from 'react';

const API_URL = "https://cosmosinvestapp.azurewebsites.net";  // URL do backend na Azure

function App() {
    const [news, setNews] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/fetch-news/${query}`);
            const data = await response.json();
            setNews(data.articles || []);
        } catch (error) {
            console.error("Erro ao buscar notícias:", error);
        }
        setLoading(false);
    };

    const fetchSavedNews = async () => {
        try {
            const response = await fetch(`${API_URL}/news`);
            const data = await response.json();
            setNews(data);
        } catch (error) {
            console.error("Erro ao buscar notícias salvas:", error);
        }
    };

    useEffect(() => {
        fetchSavedNews();
    }, []);

    return (
        <div className="App" style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Cosmos Invest - Monitoramento de Notícias</h1>
            <input 
                type="text" 
                placeholder="Digite o termo da pesquisa" 
                value={query} 
                onChange={e => setQuery(e.target.value)}
            />
            <button onClick={fetchNews} disabled={loading}>
                {loading ? "Carregando..." : "Buscar Notícias"}
            </button>

            <div>
                <h2>Notícias Encontradas:</h2>
                {news.length === 0 ? (
                    <p>Nenhuma notícia encontrada.</p>
                ) : (
                    <ul>
                        {news.map((item, index) => (
                            <li key={index}>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <p><strong>Fonte:</strong> {item.source?.name || item.source}</p>
                                <p><strong>Sentimento:</strong> {item.sentiment || "Não classificado"}</p>
                                <p><strong>Categoria:</strong> {item.category || "Desconhecida"}</p>
                                <hr />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default App;
