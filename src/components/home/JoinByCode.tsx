import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseLobbyCode } from '@/lib/lobby-code';

export function JoinByCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const go = () => {
    const id = parseLobbyCode(code);
    if (!id) return void toast.error('Link ou código inválido');
    navigate({ to: '/lobby/$matchId', params: { matchId: id } });
  };
  return (
    <form
      aria-label="Entrar na pelada por link ou código"
      onSubmit={(e) => { e.preventDefault(); go(); }}
      className="flex items-center gap-2 rounded-lg border border-primary/40 bg-card p-2 pl-4"
    >
      <Link2 className="size-4 shrink-0 text-primary" />
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Inserir link ou código da pelada"
        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="sm" className="shrink-0">
        Entrar no Lobby <ArrowRight />
      </Button>
    </form>
  );
}
