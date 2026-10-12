import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Cadastro de Atleta — Súmula FC" },
      { name: "description", content: "Crie seu cadastro de atleta e entre na súmula." },
      { property: "og:title", content: "Cadastro de Atleta — Súmula FC" },
      { property: "og:description", content: "Crie seu cadastro de atleta e entre na súmula." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Register,
});

const schema = z.object({
  nome: z.string().trim().min(3, "Mínimo 3 letras").max(100),
  apelido: z.string().trim().min(2, "2 a 20 caracteres").max(20, "2 a 20 caracteres").regex(/^[a-zA-Z0-9_]+$/, "Sem espaços ou símbolos"),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});
type Form = z.infer<typeof schema>;

function Register() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const pw = watch("password") ?? "";
  const checks = [
    { ok: pw.length >= 8, label: "Mínimo 8 caracteres" },
    { ok: /[A-Z]/.test(pw), label: "1 letra maiúscula" },
    { ok: /[0-9]/.test(pw), label: "1 número" },
  ];

  const onSubmit = async (v: Form) => {
    const { data: taken } = await supabase.from("profiles").select("id").eq("apelido", v.apelido).maybeSingle();
    if (taken) return void toast.error("Esse apelido já está na súmula");
    const { error } = await supabase.auth.signUp({
      email: v.email, password: v.password,
      options: { emailRedirectTo: window.location.origin, data: { nome: v.nome, apelido: v.apelido } },
    });
    if (error) return void toast.error(error.message);
    setDone(true);
  };

  const field = (name: keyof Form, label: string, type = "text") => (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <Input type={type} {...register(name)} />
      {errors[name] && name !== "password" && <span className="text-xs text-destructive">{errors[name]?.message}</span>}
    </label>
  );

  return (
    <Shell>
      <div className="mx-auto mt-6 max-w-md rounded-2xl bg-card p-8">
        {done ? (
          <div className="text-center">
            <h1 className="text-4xl">Quase lá!</h1>
            <p className="mt-3 text-muted-foreground">Confirme seu cadastro pelo link enviado ao seu e-mail.</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl">Cadastro de <span className="text-primary">Atleta</span></h1>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
              {field("nome", "Nome Completo")}
              {field("apelido", "Apelido / Vulgo para Súmula")}
              {field("email", "Endereço de E-mail", "email")}
              {field("password", "Senha", "password")}
              <ul className="-mt-1 flex flex-col gap-1 text-sm">
                {checks.map((c) => (
                  <li key={c.label} className={c.ok ? "flex items-center gap-2 text-primary" : "flex items-center gap-2 text-muted-foreground"}>
                    {c.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {c.label}
                  </li>
                ))}
              </ul>
              <button disabled={isSubmitting} className="pill justify-center bg-primary text-primary-foreground disabled:opacity-60">
                Concluir Cadastro de Atleta
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/auth" className="font-bold text-primary">Entrar</Link>
            </p>
          </>
        )}
      </div>
    </Shell>
  );
}
