import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
      <Card className="mx-4 w-full max-w-md border-white/20 bg-black/60 text-card-foreground backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="mb-4 flex gap-2">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <h1 className="font-headline-md text-2xl font-bold text-primary">404 — vector not found</h1>
          </div>

          <p className="mt-4 font-mono-data text-sm text-muted-foreground">
            The requested trajectory does not exist in this mission shell.
          </p>
          <Link
            href="/"
            className="font-label-caps mt-6 inline-block text-xs tracking-widest text-red-500 hover:text-red-400"
          >
            RETURN_TO_STARCHILD
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
