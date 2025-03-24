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

    // Paginação
    const indexOfLastNews = currentPage * newsPerPage;
    const indexOfFirstNews = indexOfLastNews - newsPerPage;
    const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
    const totalPages = Math.ceil(filteredNews.length / newsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

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
                <select value={newsPerPage} onChange={(e) => setNewsPerPage(Number(e.target.value))} className="p-2 border border-gray-300 rounded-md">
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={80}>80 por página</option>
                    <option value={100}>100 por página</option>
                </select>

                <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                    <option value="">Filtrar por Fonte</option>
                    {uniqueSources.map((source, index) => <option key={index} value={source}>{source}</option>)}
                </select>

                <select value={selectedSentiment} onChange={(e) => setSelectedSentiment(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                    <option value="">Filtrar por Sentimento</option>
                    <option value="Positivo">Positivo</option>
                    <option value="Negativo">Negativo</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Não classificado">Não classificado</option>
                </select>

                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                    <option value="">Filtrar por Categoria</option>
                    {uniqueCategories.map((category, index) => <option key={index} value={category}>{category}</option>)}
                </select>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-4">
                {currentNews.map((item, index) => (
                    <div key={index} className={`py-4 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p>{item.description}</p>
                        <p><strong>Fonte:</strong> {item.source?.name || "Desconhecida"}</p>
                        <p><strong>Sentimento:</strong> {renderSentiment(item.sentiment)}</p>
                        <p><strong>Data:</strong> {new Date(item.publishedAt).toLocaleString()}</p>
                        {item.url && (
                            <p>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    Ler notícia completa
                                </a>
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center space-x-4 mb-8">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 bg-gray-300 rounded-md">Anterior</button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 bg-gray-300 rounded-md">Próximo</button>
            </div>
        </div>
    );
}

export default App;
