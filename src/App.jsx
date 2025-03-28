import React, { useState, useEffect } from 'react';

const API_URL = "https://cosmosinvestapp.azurewebsites.net";  // URL do backend na Azure

function App() {
    const [news, setNews] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedSentiment, setSelectedSentiment] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortOrder, setSortOrder] = useState("recentes");
    const [currentPage, setCurrentPage] = useState(1);
    const [newsPerPage, setNewsPerPage] = useState(20);

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

    const fetchGoogleNews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/fetch-google-news/${query}`);
            const data = await response.json();
            const analyzedNews = await Promise.all(data.articles.map(async (item) => {
                const sentimentResponse = await fetch(`${API_URL}/analyze-sentiment/?text=${encodeURIComponent(item.title)}`);
                const sentimentData = await sentimentResponse.json();
                return { ...item, sentiment: sentimentData.sentiment };
            }));
            setNews(analyzedNews);
        } catch (error) {
            console.error("Erro ao buscar notícias do Google:", error);
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

    const renderSentiment = (sentiment) => {
        switch (sentiment) {
            case "positive":
                return <span className="text-green-600">👍 Positivo</span>;
            case "negative":
                return <span className="text-red-600">👎 Negativo</span>;
            case "neutral":
                return <span className="text-gray-600">🤷 Neutro</span>;
            default:
                return <span className="text-yellow-600">❓ Não classificado</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">Cosmos Invest - Monitoramento de Notícias</h1>

            <div className="flex space-x-4 mb-8 items-center">
                <input 
                    type="text" 
                    placeholder="Digite o termo da pesquisa" 
                    value={query} 
                    onChange={e => setQuery(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                />
                <button 
                    onClick={fetchNews} 
                    disabled={loading} 
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {loading ? "Carregando API..." : "Buscar API"}
                </button>
                <button 
                    onClick={fetchGoogleNews} 
                    disabled={loading} 
                    className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    {loading ? "Carregando Google News..." : "Buscar Google News"}
                </button>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-4">
                {news.map((item, index) => (
                    <div key={index} className={`py-4 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p>{item.description}</p>
                        <p><strong>Fonte:</strong> {item.source?.name || "Desconhecida"}</p>
                        <p><strong>Sentimento:</strong> {renderSentiment(item.sentiment)}</p>
                        <p><strong>Data:</strong> {item.published_at || "Data não disponível"}</p>
                        {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Ler notícia completa
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
