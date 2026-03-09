import React, { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { bookmakersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Bookmakers = () => {
  const [bookmakers, setBookmakers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmaker, setNewBookmaker] = useState({ name: '', current_balance: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookmakersRes, summaryRes] = await Promise.all([
        bookmakersAPI.getAll(),
        bookmakersAPI.getSummary()
      ]);
      
      setBookmakers(bookmakersRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Falha ao buscar casas de apostas');
    } finally {
      setLoading(false);
    }
  };

  const addBookmaker = async () => {
    try {
      await bookmakersAPI.create({
        name: newBookmaker.name,
        current_balance: parseFloat(newBookmaker.current_balance) || 0
      });
      
      toast.success('Casa de apostas adicionada com sucesso');
      setNewBookmaker({ name: '', current_balance: '' });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Falha ao adicionar casa de apostas');
    }
  };

  const updateBalance = async (bookmakerId, amount, type) => {
    try {
      await bookmakersAPI.updateBalance(bookmakerId, amount, type);
      toast.success('Saldo atualizado com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Falha ao atualizar saldo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saldos das Casas de Apostas</h1>
          <p className="text-gray-600 dark:text-gray-400">Acompanhe saldos em diferentes casas de apostas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Casa
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Casas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_bookmakers}</p>
              </div>
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {summary.total_balance?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Depósitos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {summary.total_deposits?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lucro Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {summary.total_profit?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Add Bookmaker Form */}
      {showAddForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adicionar Nova Casa de Apostas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome da Casa</label>
              <input
                type="text"
                className="input"
                value={newBookmaker.name}
                onChange={(e) => setNewBookmaker(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ex: Bet365"
              />
            </div>
            <div>
              <label className="label">Saldo Inicial (R$)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={newBookmaker.current_balance}
                onChange={(e) => setNewBookmaker(prev => ({ ...prev, current_balance: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              onClick={addBookmaker}
              className="btn btn-primary"
            >
              Adicionar Casa
            </button>
          </div>
        </div>
      )}

      {/* Bookmakers List */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contas das Casas de Apostas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Casa de Apostas</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Atual</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total de Depósitos</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total de Saques</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Lucro Gerado</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Número de Apostas</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bookmakers.map((bookmaker) => (
                <tr key={bookmaker.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4 text-sm font-medium">{bookmaker.name}</td>
                  <td className="py-2 px-4 text-sm">
                    <span className={bookmaker.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      R$ {bookmaker.current_balance?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm">R$ {bookmaker.total_deposits?.toFixed(2) || '0.00'}</td>
                  <td className="py-2 px-4 text-sm">R$ {bookmaker.total_withdrawals?.toFixed(2) || '0.00'}</td>
                  <td className="py-2 px-4 text-sm">
                    <span className={bookmaker.profit_generated >= 0 ? 'text-green-600' : 'text-red-600'}>
                      R$ {bookmaker.profit_generated?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm">{bookmaker.number_of_bets || 0}</td>
                  <td className="py-2 px-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const amount = prompt('Digite o valor do depósito:');
                          if (amount && !isNaN(amount)) {
                            updateBalance(bookmaker.id, parseFloat(amount), 'deposit');
                          }
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Depositar
                      </button>
                      <button
                        onClick={() => {
                          const amount = prompt('Digite o valor do saque:');
                          if (amount && !isNaN(amount)) {
                            updateBalance(bookmaker.id, parseFloat(amount), 'withdrawal');
                          }
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Sacar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookmakers;
