const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const defaultPath = path.join(__dirname, '..', 'Planilha_Atualizada.xlsx');
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;

if (!fs.existsSync(filePath)) {
  console.error('Arquivo não encontrado:', filePath);
  process.exit(1);
}

console.log('Lendo planilha:', filePath);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

console.log('Aba:', sheetName);
console.log('Total de linhas (sem cabeçalho em branco):', rows.length);

if (rows.length === 0) {
  console.log('Nenhuma linha de dados encontrada.');
  process.exit(0);
}

console.log('Colunas detectadas:', Object.keys(rows[0]));
console.log('Primeiras 3 linhas de exemplo:');
rows.slice(0, 3).forEach((row, idx) => {
  console.log(`Linha ${idx + 1}:`, row);
});

process.exit(0);

