
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WeddingCompoent from "./WeedingComponent/WeddingCompoent";
import WalimaComponent from "./WalimaComponent/WalimaComponent";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WeddingCompoent />} />
        <Route path="/walima" element={<WalimaComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;