import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";


export default function SiteLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-sand-light">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
