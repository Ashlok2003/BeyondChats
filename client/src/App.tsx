import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-950">
                <Routes>
                    <Route path="/" element={<ArticleList />} />
                    <Route path="/article/:id" element={<ArticleDetail />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
