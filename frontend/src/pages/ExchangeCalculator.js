import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculatorsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ExchangeCalculator = () => {
  const [formData, setFormData] = useState({
    back_odds: '',
    lay_odds: '',
    stake: '',
    commission: '4.5'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateExchange = async () => {
    try {
      setLoading(true);
      
      const response = await calculatorsAPI.calculateExchange({
        backOdds: parseFloat(formData.back_odds),
        layOdds: parseFloat(formData.lay_odds),
        stake: parseFloat(formData.stake),
        commission: parseFloat(formData.commission)
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error calculating exchange:', error);
      toast.error('Falha ao calcular exchange');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calculadora de Exchange</h1>
        <p className="text-gray-600 dark:text-gray-400">Calcule stakes de lay e responsabilidades</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuração da Exchange</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label">Back Odds</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.back_odds}
              onChange={(e) => handleChange('back_odds', e.target.value)}
              placeholder="2.50"
            />
          </div>

          <div>
            <label className="label">Lay Odds</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.lay_odds}
              onChange={(e) => handleChange('lay_odds', e.target.value)}
              placeholder="2.45"
            />
          </div>

          <div>
            <label className="label">Stake (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.stake}
              onChange={(e) => handleChange('stake', e.target.value)}
              placeholder="100.00"
            />
          </div>

          <div>
            <label className="label">Comissão (%)</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={formData.commission}
              onChange={(e) => handleChange('commission', e.target.value)}
              placeholder="4.5"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={calculateExchange}
            className="btn btn-primary"
            disabled={loading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {loading ? 'Calculando...' : 'Calcular Exchange'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resultados</h2>
          
          <div className={`p-4 rounded-lg mb-6 ${result.isArbitrage ? 'bg-green-50 dark:bg-green-900' : 'bg-amber-50 dark:bg-amber-900'}`}>
            <p className={`text-center ${result.isArbitrage ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
              <strong>{result.isArbitrage ? 'Oportunidade de Arbitragem!' : 'Sem Arbitragem'}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lay Stake</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {result.layStake}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Responsabilidade</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {result.liability}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Back</p>
              <p className="text-xl font-bold text-green-600">R$ {result.backWinProfit}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Lay</p>
              <p className="text-xl font-bold text-green-600">R$ {result.layWinProfit}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Garantido</p>
              <p className={`text-2xl font-bold ${parseFloat(result.guaranteedProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {result.guaranteedProfit}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Exposição Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {result.totalExposure}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Análise Detalhada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Aposta Back</h4>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700 dark:text-blue-300">Stake: R$ {formData.stake}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Odds: {formData.back_odds}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Retorno: R$ {(parseFloat(formData.stake) * parseFloat(formData.back_odds)).toFixed(2)}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Lucro: R$ {result.backWinProfit}</p>
                </div>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Aposta Lay</h4>
                <div className="space-y-1">
                  <p className="text-sm text-orange-700 dark:text-orange-300">Stake: R$ {result.layStake}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Odds: {formData.lay_odds}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Responsabilidade: R$ {result.liability}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Lucro: R$ {result.layWinProfit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeCalculator;
