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
        <div className="relative min-h-screen bg-[#050505]">
          <Navigation />
          <main className="relative z-10 min-h-screen pt-16 pb-12 md:pt-20 md:pb-14">
            <Router />
          </main>
          <footer className="fixed bottom-0 left-0 z-50 flex h-10 w-full items-center justify-between border-t-2 border-white bg-black/90 px-3 sm:px-6 md:px-12">
            <div className="font-label-caps text-[9px] tracking-widest text-white sm:text-[10px]">
              © Discovery One — Arcana Readings
            </div>
            <div className="hidden gap-6 sm:flex">
              <span className="font-label-caps text-[10px] tracking-widest text-white/70">
                PROTOCOL_AI
              </span>
              <span className="font-label-caps text-[10px] tracking-widest text-white/70">
                TELEMETRY_LOG
              </span>
            </div>
          </footer>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
