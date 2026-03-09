import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { calculatorsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ArbitrageCalculator = () => {
  const [outcomes, setOutcomes] = useState([
    { odds: '', stake: '', description: '' }
  ]);
  const [totalStake, setTotalStake] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addOutcome = () => {
    setOutcomes([...outcomes, { odds: '', stake: '', description: '' }]);
  };

  const removeOutcome = (index) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const updateOutcome = (index, field, value) => {
    const updatedOutcomes = [...outcomes];
    updatedOutcomes[index] = { ...updatedOutcomes[index], [field]: value };
    setOutcomes(updatedOutcomes);
  };

  const calculateArbitrage = async () => {
    try {
      setLoading(true);
      
      const validOutcomes = outcomes.filter(outcome => outcome.odds && parseFloat(outcome.odds) > 0);
      
      if (validOutcomes.length < 2) {
        toast.error('Pelo menos 2 resultados com odds válidas são necessários');
        setLoading(false);
        return;
      }

      const totalStakeVal = parseFloat(totalStake) || 100;
      const response = await calculatorsAPI.calculateArbitrage({
        odds: validOutcomes.map(o => ({ odds: parseFloat(o.odds), description: o.description })),
        totalStake: totalStakeVal
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error calculating arbitrage:', error);
      toast.error('Falha ao calcular arbitragem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calculadora de Arbitragem</h1>
        <p className="text-gray-600 dark:text-gray-400">Encontre oportunidades de lucro garantido</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuração da Arbitragem</h2>
        
        <div className="space-y-4 mb-6">
          {outcomes.map((outcome, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Resultado {index + 1}</h3>
                {outcomes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(index)}
                    className="btn btn-outline btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Descrição</label>
                  <input
                    type="text"
                    className="input"
                    value={outcome.description}
                    onChange={(e) => updateOutcome(index, 'description', e.target.value)}
                    placeholder="ex: Vitória do Time A"
                  />
                </div>

                <div>
                  <label className="label">Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={outcome.odds}
                    onChange={(e) => updateOutcome(index, 'odds', e.target.value)}
                    placeholder="2.50"
                  />
                </div>

                <div>
                  <label className="label">Stake (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={outcome.stake}
                    onChange={(e) => updateOutcome(index, 'stake', e.target.value)}
                    placeholder="100.00"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={addOutcome}
            className="btn btn-outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Resultado
          </button>

          <div className="flex items-center space-x-4">
            <div>
              <label className="label">Stake Total (R$)</label>
              <input
                type="number"
                step="0.01"
                className="input w-48"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={calculateArbitrage}
            className="btn btn-primary"
            disabled={loading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {loading ? 'Calculando...' : 'Calcular Arbitragem'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resultados</h2>
          
          <div className={`p-4 rounded-lg mb-6 ${result.isArbitrage ? 'bg-green-50 dark:bg-green-900' : 'bg-amber-50 dark:bg-amber-900'}`}>
            <p className={`text-center ${result.isArbitrage ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
              <strong>{result.isArbitrage ? 'Oportunidade de Arbitragem!' : 'Sem Arbitragem (prob. total &gt; 100%)'}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Probabilidade Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{result.totalImpliedProbability}%</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Stake Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {result.totalStake}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Garantido</p>
              <p className="text-xl font-bold text-green-600">R$ {result.guaranteedProfit}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
              <p className={`text-xl font-bold ${parseFloat(result.roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.roi}%
              </p>
            </div>
          </div>

          {/* Stake Distribution - backend returns stakeDistribution */}
          {result.stakeDistribution && result.stakeDistribution.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Distribuição Recomendada de Stake</h3>
              <div className="space-y-2">
                {result.stakeDistribution.map((dist, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm font-medium">Resultado {index + 1} (odds {dist.odds || outcomes[index]?.odds})</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">R$ {dist.stakeAmount}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">({dist.stakePercentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArbitrageCalculator;
