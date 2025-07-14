import { LocaleSwitcher } from "@/components/switchers/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 relative" suppressHydrationWarning>
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-accent/8 to-secondary/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-gradient-to-br from-primary/6 to-muted/6 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Square Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-square-pattern"></div>
      </div>
      
      {/* Additional Square Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 bg-primary/20 rotate-45 animate-float"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-accent/20 rotate-12 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-secondary/20 rotate-45 animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-10 right-10 w-3 h-3 bg-primary/30 rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-10 w-8 h-8 border-2 border-primary/20 rotate-45 animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-10 w-6 h-6 border border-accent/20 rotate-12 animate-float" style={{ animationDelay: '5s' }}></div>
      </div>
      
      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full flex justify-end z-50">
        <div className="flex items-center gap-3 max-w-7xl p-4 md:p-6">
          <div className="bg-card/80 backdrop-blur-md border border-border/40 rounded-xl p-1 shadow-lg">
            <LocaleSwitcher
              alignHover="end"
              alignDropdown="end"
              size={"icon"}
              variant={"ghost"}
            />
          </div>
          <div className="bg-card/80 backdrop-blur-md border border-border/40 rounded-xl p-1 shadow-lg">
            <ThemeSwitcher
              alignHover="end"
              alignDropdown="end"
              size={"icon"}
              variant={"ghost"}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Fixed Height with Scroll Container */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md max-h-full overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-card/60 backdrop-blur-md border border-border/20 rounded-full px-4 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 TaskFlow. Crafted with 💜 for productivity
          </p>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
