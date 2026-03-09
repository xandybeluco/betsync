import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { calculatorsAPI } from '../services/api';
import toast from 'react-hot-toast';

const OddsBoostCalculator = () => {
  const [formData, setFormData] = useState({
    boostedOdds: '',
    normalOdds: '',
    stake: '',
    boostPercentage: ''
  });
  const [protectionBets, setProtectionBets] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate boost percentage if both odds are provided
    if (field === 'boostedOdds' || field === 'normalOdds') {
      const boosted = field === 'boostedOdds' ? parseFloat(value) : parseFloat(formData.boostedOdds);
      const normal = field === 'normalOdds' ? parseFloat(value) : parseFloat(formData.normalOdds);
      
      if (boosted && normal && normal > 0) {
        const percentage = ((boosted / normal - 1) * 100).toFixed(2);
        setFormData(prev => ({ ...prev, boostPercentage: percentage }));
      }
    }
  };

  const addProtectionBet = () => {
    setProtectionBets([...protectionBets, { odds: '', stake: '', description: '' }]);
  };

  const removeProtectionBet = (index) => {
    setProtectionBets(protectionBets.filter((_, i) => i !== index));
  };

  const updateProtectionBet = (index, field, value) => {
    const updatedBets = [...protectionBets];
    updatedBets[index] = { ...updatedBets[index], [field]: value };
    setProtectionBets(updatedBets);
  };

  const calculateOddsBoost = async () => {
    try {
      setLoading(true);
      
      const validProtectionBets = protectionBets.filter(bet => bet.odds && bet.stake);
      
      const response = await calculatorsAPI.calculateOddsBoost({
        boostedOdds: parseFloat(formData.boostedOdds),
        normalOdds: parseFloat(formData.normalOdds),
        stake: parseFloat(formData.stake),
        protectionBets: validProtectionBets,
        boostPercentage: parseFloat(formData.boostPercentage)
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error calculating odds boost:', error);
      toast.error('Falha ao calcular odds boost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calculadora de Odds Boost</h1>
        <p className="text-gray-600 dark:text-gray-400">Calcule odds boostadas com apostas de proteção</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalhes do Boost</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label">Odds Normal</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.normalOdds}
              onChange={(e) => handleChange('normalOdds', e.target.value)}
              placeholder="2.00"
            />
          </div>

          <div>
            <label className="label">Odds Boostada</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.boostedOdds}
              onChange={(e) => handleChange('boostedOdds', e.target.value)}
              placeholder="2.50"
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
            <label className="label">Porcentagem do Boost (%)</label>
            <input
              type="text"
              className="input"
              value={formData.boostPercentage}
              readOnly
              placeholder="Auto-calculado"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">Apostas de Proteção</h3>
            <button
              type="button"
              onClick={addProtectionBet}
              className="btn btn-outline btn-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Aposta de Proteção
            </button>
          </div>

          {protectionBets.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Nenhuma aposta de proteção adicionada</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Adicione apostas de proteção para cobrir sua aposta boostada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {protectionBets.map((bet, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Aposta de Proteção {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeProtectionBet(index)}
                      className="btn btn-outline btn-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Descrição</label>
                      <input
                        type="text"
                        className="input"
                        value={bet.description}
                        onChange={(e) => updateProtectionBet(index, 'description', e.target.value)}
                        placeholder="ex: Lay na Exchange"
                      />
                    </div>

                    <div>
                      <label className="label">Odds</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={bet.odds}
                        onChange={(e) => updateProtectionBet(index, 'odds', e.target.value)}
                        placeholder="2.10"
                      />
                    </div>

                    <div>
                      <label className="label">Stake (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={bet.stake}
                        onChange={(e) => updateProtectionBet(index, 'stake', e.target.value)}
                        placeholder="50.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={calculateOddsBoost}
            className="btn btn-primary"
            disabled={loading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {loading ? 'Calculando...' : 'Calcular Boost'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resultados</h2>
          
          <div className={`p-4 rounded-lg mb-6 ${result.isProfitable ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
            <p className={`text-center ${result.isProfitable ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              <strong>{result.isProfitable ? 'Oportunidade Lucrativa' : 'Não Lucrativa'}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Retorno Boostado</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {result.boostedReturn}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Retorno Normal</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {result.normalReturn}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor do Boost</p>
              <p className="text-xl font-bold text-green-600">R$ {result.boostValue}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Custo da Proteção</p>
              <p className="text-xl font-bold text-red-600">R$ {result.totalProtectionCost}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Garantido</p>
              <p className={`text-2xl font-bold ${result.guaranteedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {result.guaranteedProfit}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Exposição Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {result.totalExposure}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
              <p className={`text-xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.roi}%
              </p>
            </div>
          </div>

          {result.optimalProtectionStake && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-center text-blue-800 dark:text-blue-200">
                <strong>Stake de Proteção Ótimo: R$ {result.optimalProtectionStake}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OddsBoostCalculator;
