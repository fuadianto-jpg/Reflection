import { BrowserRouter, Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar";
import Landing from "./pages/Landing";
import Gallery from "./pages/Gallery";
import Admin from "./pages/Admin";
import AddToHomePrompt from "./components/AddToHomePrompt";

export default function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/apps" element={<Gallery />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <AddToHomePrompt />
    </BrowserRouter>
  );
}
