import { Button } from "@/components/ui/button";
import { Loader2, LogIn, MessageCircle } from "lucide-react";
import { useAuth } from "react-oidc-context";

export function LoginPage() {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background text-foreground">
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
                        <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

    if (auth.error) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-2xl">!</span>
                    </div>
                    <h2 className="text-lg font-bold">Authentication Error</h2>
                    <p className="text-sm text-muted-foreground">
                        {auth.error.message}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => auth.signinRedirect()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-dvh bg-background text-foreground">
            <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6">
                {/* Logo / Branding */}
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 blur-2xl bg-primary/15 rounded-full" />
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                            <MessageCircle className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Pulsewave Chat
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to start chatting in real-time
                        </p>
                    </div>
                </div>

                {/* Auth Buttons */}
                <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                    <Button
                        size="lg"
                        className="w-full gap-2 h-12 text-base"
                        onClick={() => auth.signinRedirect()}
                    >
                        <LogIn className="h-5 w-5" />
                        Sign In / Create Account
                    </Button>
                </div>

                <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
                    Powered by SpacetimeDB Auth
                </p>
            </div>
        </div>
    );
}
