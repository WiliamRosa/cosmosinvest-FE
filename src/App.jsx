import React, { useState, useEffect } from 'react';
import Sentiment from 'sentiment';
import Parser from 'rss-parser';

const API_URL = "https://cosmosinvestapp.azurewebsites.net";  // URL do backend na Azure
const parser = new Parser();
const sentimentAnalyzer = new Sentiment();

function App() {
    const [news, setNews] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedSentiment, setSelectedSentiment] = useState("");
    const [sortOrder, setSortOrder] = useState("recentes");
    const [currentPage, setCurrentPage] = useState(1);
    const [newsPerPage, setNewsPerPage] = useState(20);

    const fetchGoogleNews = async () => {
        setLoading(true);
        try {
            const url = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt`;
            const feed = await parser.parseURL(url);

            const articles = feed.items.map(item => {
                const sentimentResult = sentimentAnalyzer.analyze(item.title);
                let sentiment = "Não classificado";
                if (sentimentResult.score > 0) sentiment = "Positivo";
                else if (sentimentResult.score < 0) sentiment = "Negativo";
                else sentiment = "Neutro";

                return {
                    title: item.title,
                    description: item.contentSnippet,
                    source: "Google News",
                    sentiment,
                    publishedAt: item.pubDate,
                    url: item.link
                };
            });
            setNews(articles);
        } catch (error) {
            console.error("Erro ao buscar notícias do Google News:", error);
        }
        setLoading(false);
    };

    const filteredNews = news
        .filter(item =>
            (selectedSource ? item.source === selectedSource : true) &&
            (selectedSentiment ? item.sentiment === selectedSentiment : true)
        )
        .sort((a, b) => {
            if (sortOrder === "recentes") return new Date(b.publishedAt) - new Date(a.publishedAt);
            if (sortOrder === "antigas") return new Date(a.publishedAt) - new Date(b.publishedAt);
            return 0;
        });

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
                    onClick={fetchGoogleNews} 
                    disabled={loading} 
                    className="p-2 bg-green-600 text-white rounded-md"
                >
                    {loading ? "Carregando Google News..." : "Buscar Google News"}
                </button>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-4">
                {currentNews.map((item, index) => (
                    <div key={index} className="py-4 border-b">
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p>{item.description}</p>
                        <p><strong>Fonte:</strong> {item.source}</p>
                        <p><strong>Sentimento:</strong> {item.sentiment}</p>
                        <p><strong>Data:</strong> {item.publishedAt}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">Ler notícia completa</a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
