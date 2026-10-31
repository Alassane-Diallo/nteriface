import { Link, useNavigate } from "react-router";
import { Compass, House } from "lucide-react";

import { Button, Card, EmptyState } from "@/components/ui";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="pt-6">
      <Card className="overflow-hidden">
        <EmptyState
          icon={<Compass className="size-6" />}
          title="Cette page n’existe pas encore"
          description="Le lien est peut-être ancien, ou la démonstration ne couvre pas encore cette section. Revenez au fil pour continuer l’exploration."
          action={
            <Button onClick={() => navigate("/")}>
              <House className="size-4" />
              Retour au fil
            </Button>
          }
        />
        <p className="border-t border-line px-6 py-3 text-center text-[10px] text-muted">
          Vous cherchez quelque chose ?{" "}
          <Link to="/recherche" className="font-semibold text-brand hover:underline">
            Lancez une recherche
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
