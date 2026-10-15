import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
export function TeamCrest({path,name}:{path:string|null;name:string}){const {data}=useQuery({queryKey:['crest',path],enabled:!!path,staleTime:300000,queryFn:async()=>{if(!path)return null;const {data,error}=await supabase.storage.from('team-crests').createSignedUrl(path,600);if(error)throw error;return data.signedUrl;}});return data?<img src={data} alt={`Escudo ${name}`} className="size-12 shrink-0 object-contain"/>:<Shield className="size-10 shrink-0 text-primary"/>;}
