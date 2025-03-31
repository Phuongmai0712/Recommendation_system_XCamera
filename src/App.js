import { Routes, Route } from 'react-router-dom';
import CategorySelection from './components/CategorySelection';
import CriteriaSelection from './components/CriteriaSelection';
import Results from './components/Results';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CategorySelection />} />
      <Route path="/criteria/:category" element={<CriteriaSelection />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

export default App;