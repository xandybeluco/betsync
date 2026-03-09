import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { betsAPI, bookmakersAPI, operationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const betSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  bookmaker_id: z.string().min(1, 'Casa de apostas é obrigatória'),
  bet_type: z.enum(['Aposta Simples', 'Super Odd', 'Aumentada', 'Tentativa de Duplo', 'Free Bet', 'Extração de FreeBet']),
  event: z.string().min(1, 'Evento é obrigatório'),
  market: z.string().min(1, 'Mercado é obrigatório'),
  odds: z.string().refine((val) => parseFloat(val) > 0, 'Odds devem ser maiores que 0'),
  stake: z.string().refine((val) => parseFloat(val) >= 0, 'Stake deve ser 0 ou maior'),
  back_odds: z.string().optional(),
  lay_odds: z.string().optional(),
  exchange_commission: z.string().optional(),
});

const BetRegistration = () => {
  const [bookmakers, setBookmakers] = useState([]);
  const [isMultiBet, setIsMultiBet] = useState(false);
  const [operationType, setOperationType] = useState('Surebet');
  const [bets, setBets] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [calculatedFields, setCalculatedFields] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(betSchema),
    defaultValues: {
      exchange_commission: '4.5'
    }
  });

  const watchedOdds = watch('odds');
  const watchedStake = watch('stake');

  useEffect(() => {
    fetchBookmakers();
  }, []);

  useEffect(() => {
    if (watchedOdds && watchedStake) {
      const odds = parseFloat(watchedOdds);
      const stake = parseFloat(watchedStake);
      const potentialReturn = odds * stake;
      setCalculatedFields(prev => ({
        ...prev,
        potential_return: potentialReturn.toFixed(2)
      }));
    }
  }, [watchedOdds, watchedStake]);

  const fetchBookmakers = async () => {
    try {
      const response = await bookmakersAPI.getAll();
      setBookmakers(response.data);
    } catch (error) {
      toast.error('Falha ao buscar casas de apostas');
    }
  };

  const calculateExchange = () => {
    const backOdds = parseFloat(watchedOdds);
    const stake = parseFloat(watchedStake);
    const layOdds = parseFloat(watch('lay_odds') || 0);
    const commission = parseFloat(watch('exchange_commission') || 4.5);

    if (backOdds > 0 && stake > 0 && layOdds > 0) {
      const layStake = (backOdds * stake) / (layOdds - (layOdds - 1) * (commission / 100));
      const liability = layStake * (layOdds - 1);
      
      setValue('lay_stake', layStake.toFixed(2));
      setCalculatedFields(prev => ({
        ...prev,
        lay_stake: layStake.toFixed(2),
        liability: liability.toFixed(2)
      }));
    }
  };

  const onSubmitSingle = async (data) => {
    try {
      setLoading(true);
      
      const betData = {
        ...data,
        bookmaker_id: parseInt(data.bookmaker_id),
        odds: parseFloat(data.odds),
        stake: parseFloat(data.stake),
        potential_return: parseFloat(data.potential_return) || (parseFloat(data.odds) * parseFloat(data.stake)),
        ...(data.back_odds && { back_odds: parseFloat(data.back_odds) }),
        ...(data.lay_odds && { lay_odds: parseFloat(data.lay_odds) }),
        ...(data.exchange_commission && { exchange_commission: parseFloat(data.exchange_commission) }),
        ...(calculatedFields.lay_stake && { lay_stake: parseFloat(calculatedFields.lay_stake) }),
        ...(calculatedFields.liability && { liability: parseFloat(calculatedFields.liability) })
      };

      await betsAPI.create(betData);
      toast.success('Aposta criada com sucesso');
      reset();
      setCalculatedFields({});
    } catch (error) {
      console.error('Error creating bet:', error);
      toast.error(error.response?.data?.error || 'Falha ao criar aposta');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMulti = async () => {
    try {
      setLoading(true);
      
      const operationData = {
        type: operationType,
        bets: bets.map(bet => ({
          ...bet,
          bookmaker_id: parseInt(bet.bookmaker_id),
          odds: parseFloat(bet.odds),
          stake: parseFloat(bet.stake),
          potential_return: parseFloat(bet.odds) * parseFloat(bet.stake)
        }))
      };

      await operationsAPI.create(operationData);
      toast.success('Operação criada com sucesso');
      setIsMultiBet(false);
      setBets([{}]);
    } catch (error) {
      console.error('Error creating operation:', error);
      toast.error(error.response?.data?.error || 'Falha ao criar operação');
    } finally {
      setLoading(false);
    }
  };

  const addBet = () => {
    setBets([...bets, {}]);
  };

  const updateBet = (index, field, value) => {
    const updatedBets = [...bets];
    updatedBets[index] = { ...updatedBets[index], [field]: value };
    setBets(updatedBets);
  };

  const removeBet = (index) => {
    setBets(bets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registro de Apostas</h1>
        <p className="text-gray-600 dark:text-gray-400">Registre suas apostas e acompanhe seu desempenho</p>
      </div>

      {/* Toggle between single and multi-bet */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tipo de Aposta</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMultiBet(false)}
              className={`btn ${!isMultiBet ? 'btn-primary' : 'btn-outline'}`}
            >
              Aposta Simples
            </button>
            <button
              onClick={() => setIsMultiBet(true)}
              className={`btn ${isMultiBet ? 'btn-primary' : 'btn-outline'}`}
            >
              Operação Multi-Aposta
            </button>
          </div>
        </div>

        {!isMultiBet ? (
          /* Single Bet Form - Simplificado */
          <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Data *</label>
                <input
                  type="date"
                  className="input"
                  {...register('date')}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="label">Casa de Apostas *</label>
                <select className="select" {...register('bookmaker_id')}>
                  <option value="">Selecione</option>
                  {bookmakers.map((bookmaker) => (
                    <option key={bookmaker.id} value={bookmaker.id}>
                      {bookmaker.name}
                    </option>
                  ))}
                </select>
                {errors.bookmaker_id && <p className="text-red-500 text-sm mt-1">{errors.bookmaker_id.message}</p>}
              </div>

              <div>
                <label className="label">Evento *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="ex: Brasil x Argentina"
                  {...register('event')}
                />
                {errors.event && <p className="text-red-500 text-sm mt-1">{errors.event.message}</p>}
              </div>

              <div>
                <label className="label">Mercado *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="ex: 1x2, Handicap, Over/Under"
                  {...register('market')}
                />
                {errors.market && <p className="text-red-500 text-sm mt-1">{errors.market.message}</p>}
              </div>

              <div>
                <label className="label">Odds *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="2.50"
                  {...register('odds')}
                />
                {errors.odds && <p className="text-red-500 text-sm mt-1">{errors.odds.message}</p>}
              </div>

              <div>
                <label className="label">Stake (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="100.00"
                  {...register('stake')}
                />
                {errors.stake && <p className="text-red-500 text-sm mt-1">{errors.stake.message}</p>}
              </div>

              <div>
                <label className="label">Tipo de Aposta</label>
                <select className="select" {...register('bet_type')}>
                  <option value="Aposta Simples">Aposta Simples</option>
                  <option value="Super Odd">Super Odd</option>
                  <option value="Aumentada">Aumentada</option>
                  <option value="Tentativa de Duplo">Tentativa de Duplo</option>
                  <option value="Free Bet">Free Bet</option>
                  <option value="Extração de FreeBet">Extração de FreeBet</option>
                </select>
              </div>

              <div>
                <label className="label">Retorno Potencial</label>
                <input
                  type="text"
                  className="input"
                  value={`R$ ${calculatedFields.potential_return || '0.00'}`}
                  readOnly
                />
              </div>
            </div>

            {/* Exchange Fields - Compact */}
            {watch('bet_type') === 'Exchange Hedge' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Detalhes da Exchange</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Back Odds</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      {...register('back_odds')}
                    />
                  </div>

                  <div>
                    <label className="label">Lay Odds</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      {...register('lay_odds')}
                    />
                  </div>

                  <div>
                    <label className="label">Comissão (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('exchange_commission')}
                    />
                  </div>

                  <div>
                    <label className="label">Lay Stake</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={calculatedFields.lay_stake || ''}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={calculateExchange}
                        className="btn btn-outline"
                      >
                        <Calculator className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {calculatedFields.liability && (
                  <div className="mt-4">
                    <label className="label">Responsabilidade</label>
                    <input
                      type="text"
                      className="input"
                      value={`R$ ${calculatedFields.liability}`}
                      readOnly
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Aposta'}
              </button>
            </div>
          </form>
        ) : (
          /* Multi-Bet Operation Form - Simplificado */
          <div className="space-y-4">
            <div>
              <label className="label">Tipo de Operação</label>
              <select 
                className="select" 
                value={operationType} 
                onChange={(e) => setOperationType(e.target.value)}
              >
                <option value="Aposta Simples">Aposta Simples</option>
                <option value="Super Odd">Super Odd</option>
                <option value="Aumentada">Aumentada</option>
                <option value="Tentativa de Duplo">Tentativa de Duplo</option>
                <option value="Free Bet">Free Bet</option>
                <option value="Extração de FreeBet">Extração de FreeBet</option>
              </select>
            </div>

            <div className="space-y-4">
              {bets.map((bet, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Aposta {index + 1}</h3>
                    {bets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBet(index)}
                        className="btn btn-outline btn-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="label">Casa de Apostas *</label>
                      <select
                        className="select"
                        value={bet.bookmaker_id || ''}
                        onChange={(e) => updateBet(index, 'bookmaker_id', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {bookmakers.map((bookmaker) => (
                          <option key={bookmaker.id} value={bookmaker.id}>
                            {bookmaker.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Evento *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="ex: Brasil x Argentina"
                        value={bet.event || ''}
                        onChange={(e) => updateBet(index, 'event', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">Mercado *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="ex: 1x2, Handicap"
                        value={bet.market || ''}
                        onChange={(e) => updateBet(index, 'market', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">Odds *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        placeholder="2.50"
                        value={bet.odds || ''}
                        onChange={(e) => updateBet(index, 'odds', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">Stake (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        placeholder="100.00"
                        value={bet.stake || ''}
                        onChange={(e) => updateBet(index, 'stake', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">Retorno Potencial</label>
                      <input
                        type="text"
                        className="input"
                        value={`R$ ${(bet.odds && bet.stake) ? (parseFloat(bet.odds) * parseFloat(bet.stake)).toFixed(2) : '0.00'}`}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={addBet}
                className="btn btn-outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aposta
              </button>

              <button
                type="button"
                onClick={onSubmitMulti}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Operação'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetRegistration;
