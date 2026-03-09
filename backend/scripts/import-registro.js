const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const Bet = require('../models/Bet');
const Bookmaker = require('../models/Bookmaker');

function excelDateToISO(serial) {
  if (typeof serial !== 'number') return null;
  // Excel serial date (days since 1899-12-30) -> JS Date
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400 * 1000;
  const date = new Date(utcValue);
  return date.toISOString().slice(0, 10);
}

const ALLOWED_BET_TYPES = [
  'Aposta Simples',
  'Super Odd',
  'Aumentada',
  'Tentativa de Duplo',
  'Free Bet',
  'Extração de FreeBet',
];

function normalizeBetType(raw) {
  if (!raw) return 'Aposta Simples';
  const value = String(raw).trim();
  if (ALLOWED_BET_TYPES.includes(value)) return value;
  // Mapeamentos simples
  if (value.toUpperCase().includes('GIRO')) return 'Aposta Simples';
  if (value.toUpperCase().includes('SUPER')) return 'Super Odd';
  return 'Aposta Simples';
}

async function getOrCreateBookmaker(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  let bm = await Bookmaker.getByName(trimmed);
  if (bm) return bm;

  return Bookmaker.create({ name: trimmed });
}

async function main() {
  const filePath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, '..', '..', 'Planilha_Atualizada.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error('Arquivo da planilha não encontrado:', filePath);
    process.exit(1);
  }

  console.log('Importando a partir de:', filePath);

  const workbook = XLSX.readFile(filePath);
  const sheetName = '2. REGISTRO';
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.error('Aba "2. REGISTRO" não encontrada na planilha.');
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  console.log(`Total de linhas (dados): ${rows.length}`);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const id = row['ID'];
      const excelDate = row['Data'];
      const jogo = row['Jogo'];
      const casaAposta = row['Casa de Aposta'];
      const tipoApostaRaw = row['Tipo de Aposta'];

      if (!jogo || !casaAposta || !excelDate) {
        skipped++;
        continue;
      }

      const oddsVal = parseFloat(
        row['Odd 1'] || row['Odd X'] || row['Odd 2'] || 0
      );
      const stakeVal = parseFloat(
        row['Stake 1'] || row['Stake X'] || row['Stake 2'] || 0
      );

      if (!oddsVal || !stakeVal) {
        skipped++;
        continue;
      }

      const lucroLiquidoRaw = row['Lucro Líquido'];
      const lucroLiquido =
        typeof lucroLiquidoRaw === 'number'
          ? lucroLiquidoRaw
          : parseFloat(lucroLiquidoRaw || 0);

      let status = 'Open';
      if (lucroLiquido > 0) status = 'Won';
      else if (lucroLiquido < 0) status = 'Lost';

      const dateStr = excelDateToISO(excelDate);
      const bookmaker = await getOrCreateBookmaker(casaAposta);
      if (!bookmaker) {
        console.warn('Bookmaker inválido; pulando linha ID', id);
        skipped++;
        continue;
      }

      const betType = normalizeBetType(tipoApostaRaw);

      const odds = oddsVal;
      const stake = stakeVal;
      const potentialReturn = odds * stake;

      const betData = {
        operation_id: null,
        bookmaker_id: bookmaker.id,
        date: dateStr,
        bet_type: betType,
        event: String(jogo),
        market: '1X2',
        odds,
        stake,
        potential_return: potentialReturn,
        back_odds: null,
        lay_odds: null,
        exchange_commission: 4.5,
        lay_stake: null,
        liability: null,
        status,
      };

      const created = await Bet.create(betData);

      if (status !== 'Open' && lucroLiquido !== 0) {
        await Bet.update(created.id, {
          status,
          profit_loss: lucroLiquido,
        });
      }

      imported++;
      if (imported % 100 === 0) {
        console.log(`Importadas ${imported} apostas até agora...`);
      }
    } catch (err) {
      console.error('Erro ao importar linha, pulando. Detalhe:', err.message);
      skipped++;
    }
  }

  console.log(`Concluído. Importadas: ${imported}, Ignoradas: ${skipped}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro geral na importação:', err);
  process.exit(1);
});

