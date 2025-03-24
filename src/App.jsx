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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">Cosmos Invest - Monitoramento de Notícias</h1>
            
            <div className="flex space-x-4 mb-8">
                <input 
                    type="text" 
                    placeholder="Digite o termo da pesquisa" 
                    value={query} 
                    onChange={e => setQuery(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    onClick={fetchNews} 
                    disabled={loading} 
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {loading ? "Carregando..." : "Buscar Notícias"}
                </button>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Notícias Encontradas:</h2>
                {news.length === 0 ? (
                    <p>Nenhuma notícia encontrada.</p>
                ) : (
                    <ul>
                        {news.map((item, index) => (
                            <li 
                                key={index} 
                                className={`border-b border-gray-300 py-4 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                            >
                                <h3 className="text-xl font-semibold">{item.title}</h3>
                                <p className="text-gray-700">{item.description}</p>
                                <p><strong>Fonte:</strong> {item.source?.name || item.source}</p>
                                <p><strong>Sentimento:</strong> {item.sentiment || "Não classificado"}</p>
                                <p><strong>Categoria:</strong> {item.category || "Desconhecida"}</p>
                                <p><strong>Data da Notícia:</strong> {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "Não informada"}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default App;
