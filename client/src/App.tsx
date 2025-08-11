import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Decks from "@/pages/decks";
import CMS from "@/pages/cms";
import Navigation from "@/components/layout/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/decks" component={Decks} />
      <Route path="/cms" component={CMS} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen overflow-hidden">
          {/* Mystical Background */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-mystic-900 via-mystic-800 to-mystic-600 opacity-30"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          
          {/* Mystical Overlay Effects */}
          <div className="fixed inset-0 bg-gradient-to-t from-mystic-900/90 via-transparent to-mystic-900/40" />
          <div className="fixed top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-mystic-gold/10 rounded-full blur-3xl animate-mystical-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-mystical-glow" style={{animationDelay: "1s"}} />
          </div>

          <Navigation />
          <main className="relative z-10 min-h-screen pt-8">
            <Router />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
