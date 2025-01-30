-- Criar tabela de mensagens
create table mensagens (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    nome text not null,
    mensagem text not null
);

-- Configurar RLS (Row Level Security)
alter table mensagens enable row level security;

-- Criar política para permitir inserções anônimas
create policy "Permitir inserções anônimas"
on mensagens for insert
to anon
with check (true);

-- Criar política para permitir leitura anônima
create policy "Permitir leitura anônima"
on mensagens for select
to anon
using (true);
