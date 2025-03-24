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

    const renderSentiment = (sentiment) => {
        switch (sentiment) {
            case "Positivo":
                return <span className="text-green-600">👍 Positivo</span>;
            case "Negativo":
                return <span className="text-red-600">👎 Negativo</span>;
            case "Neutro":
                return <span className="text-gray-600">🤷 Neutro</span>;
            case "Não classificado":
            default:
                return <span className="text-yellow-600">❓ Não classificado</span>;
        }
    };

    // Filtrar e ordenar as notícias
    const filteredNews = news
        .filter(item => 
            (selectedSource ? item.source?.name === selectedSource : true) &&
            (selectedSentiment ? item.sentiment === selectedSentiment : true) &&
            (selectedCategory ? item.category === selectedCategory : true)
        )
        .sort((a, b) => {
            if (sortOrder === "recentes") {
                return new Date(b.publishedAt) - new Date(a.publishedAt);
            } else if (sortOrder === "antigas") {
                return new Date(a.publishedAt) - new Date(b.publishedAt);
            }
            return 0;
        });

    const uniqueSources = [...new Set(news.map(item => item.source?.name).filter(Boolean))];
    const uniqueCategories = [...new Set(news.map(item => item.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">Cosmos Invest - Monitoramento de Notícias</h1>
            
            <div className="flex space-x-4 mb-8 items-center">
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

            {/* Filtros */}
            <div className="flex space-x-4 mb-6">
                <select 
                    className="p-2 border border-gray-300 rounded-md"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                >
                    <option value="">Filtrar por Fonte</option>
                    {uniqueSources.map((source, index) => (
                        <option key={index} value={source}>{source}</option>
                    ))}
                </select>

                <select 
                    className="p-2 border border-gray-300 rounded-md"
                    value={selectedSentiment}
                    onChange={(e) => setSelectedSentiment(e.target.value)}
                >
                    <option value="">Filtrar por Sentimento</option>
                    <option value="Positivo">Positivo</option>
                    <option value="Negativo">Negativo</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Não classificado">Não classificado</option>
                </select>

                <select 
                    className="p-2 border border-gray-300 rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Filtrar por Categoria</option>
                    {uniqueCategories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>

                <select 
                    className="p-2 border border-gray-300 rounded-md"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="recentes">Mais Recentes</option>
                    <option value="antigas">Mais Antigas</option>
                </select>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Notícias Encontradas:</h2>
                {filteredNews.length === 0 ? (
                    <p>Nenhuma notícia encontrada.</p>
                ) : (
                    <ul>
                        {filteredNews.map((item, index) => (
                            <li 
                                key={index} 
                                className={`border-b border-gray-300 py-4 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                            >
                                <h3 className="text-xl font-semibold">{item.title}</h3>
                                <p className="text-gray-700">{item.description}</p>
                                <p><strong>Fonte:</strong> {item.source?.name || item.source}</p>
                                <p><strong>Sentimento:</strong> {renderSentiment(item.sentiment)}</p>
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
