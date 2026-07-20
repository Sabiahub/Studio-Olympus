-- Script para atualizar os handles do Instagram dos artistas existentes
-- Certifique-se de que os nomes correspondem aos armazenados no banco (usando ILIKE '%Nome%' para maior flexibilidade caso tenham sobrenomes).

UPDATE artists SET instagram = 'artana.bruxa' WHERE name ILIKE '%Bruxa%';
UPDATE artists SET instagram = 'caiocesar.ttt' WHERE name ILIKE '%Caio%';
UPDATE artists SET instagram = 'amaral.ink' WHERE name ILIKE '%Fera%';
UPDATE artists SET instagram = 'glass_ink15' WHERE name ILIKE '%Glass%';
UPDATE artists SET instagram = 'inkjottas' WHERE name ILIKE '%Jottas%';
UPDATE artists SET instagram = 'joaoserraink' WHERE name ILIKE '%Joao%';
UPDATE artists SET instagram = 'leonkstano_' WHERE name ILIKE '%Leon%';
UPDATE artists SET instagram = 'luanksttano.ink' WHERE name ILIKE '%Luan%';
UPDATE artists SET instagram = 'luscatattoo' WHERE name ILIKE '%Lusca%';
UPDATE artists SET instagram = 'amanuprata' WHERE name ILIKE '%Manu%';
UPDATE artists SET instagram = 'resendemarcella.tattoo' WHERE name ILIKE '%Marcella%';
UPDATE artists SET instagram = 'marcellusdiaztattoo' WHERE name ILIKE '%Marcellus%';
UPDATE artists SET instagram = 'mariaclaratatuadora' WHERE name ILIKE '%Maria%';
UPDATE artists SET instagram = 'passatitattoo' WHERE name ILIKE '%Passati%';
UPDATE artists SET instagram = 'ruanadiaztattoo' WHERE name ILIKE '%Ruana%';
UPDATE artists SET instagram = 'rubbikx' WHERE name ILIKE '%Rubi%';

-- Query de conferência solicitada
-- Rode esta instrução logo após os updates para confirmar visualmente se todos os 16 foram atualizados com sucesso.
SELECT name, instagram FROM artists ORDER BY name;
