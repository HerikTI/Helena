-- Consulta para ver o total de pessoas confirmadas
SELECT 
    COUNT(*) as total_confirmacoes,
    SUM(qtde_pessoas) as total_pessoas
FROM confirmacoes;
