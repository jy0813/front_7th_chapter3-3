import { BrowserRouter as Router } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { ModalProvider } from "@/app/providers/ModalProvider";
import { ModalContainer } from "@/app/ui/ModalContainer";
import { Header } from "@/widgets/header/ui";
import { Footer } from "@/widgets/footer/ui";
import PostsManagerPage from "@/pages/PostsManagerPage";

const App = () => {
  return (
    <QueryProvider>
      <ModalProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <PostsManagerPage />
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
