-- Adicionar coluna para nomes dos acompanhantes
alter table confirmacoes
add column nomes_acompanhantes text;

-- Atualizar a descrição da coluna qtde_pessoas
comment on column confirmacoes.qtde_pessoas is 'Número de acompanhantes (não inclui a pessoa que confirmou)';
