import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Menu, X, Sparkles, LayersIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: "/", icon: Sparkles, label: "Reading" },
    { path: "/decks", icon: LayersIcon, label: "Decks" },
    { path: "/cms", icon: Upload, label: "Upload" },
  ];

  return (
    <>
      <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-mystic-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Moon className="text-mystic-gold text-2xl" />
                <h1 className="font-cinzel text-xl font-semibold text-mystic-gold">Mystic Tarot</h1>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost" 
                      className={`${
                        isActive 
                          ? "text-mystic-gold" 
                          : "text-mystic-gold-light hover:text-mystic-gold"
                      } transition-colors bg-transparent hover:bg-mystic-600/20`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-mystic-gold hover:bg-mystic-600/20"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className="text-2xl text-mystic-gold-light hover:text-mystic-gold transition-colors bg-transparent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-6 h-6 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="text-mystic-gold-light hover:text-mystic-gold transition-colors bg-transparent"
              onClick={toggleMobileMenu}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
