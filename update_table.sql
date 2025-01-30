-- Adicionar coluna de quantidade de pessoas
ALTER TABLE confirmacoes
ADD COLUMN qtde_pessoas integer not null default 1;
