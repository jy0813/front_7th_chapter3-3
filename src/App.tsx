import { BrowserRouter as Router } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { ModalProvider } from "@/app/providers/ModalProvider";
import { ModalContainer } from "@/app/ui/ModalContainer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import PostsManagerPage from "@/pages/PostsManagerPage"; // Legacy
import PostsManagerPageV2 from "@/pages/PostsManagerPageV2"; // FSD Version

const App = () => {
  return (
    <QueryProvider>
      <ModalProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <PostsManagerPageV2 />
            </main>
            <Footer />
          </div>
          <ModalContainer />
        </Router>
      </ModalProvider>
    </QueryProvider>
  );
};

export default App;
