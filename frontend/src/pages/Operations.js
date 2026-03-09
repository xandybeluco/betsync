import React, { useState, useEffect } from 'react';
import { operationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Operations = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await operationsAPI.getAll();
      setOperations(response.data);
    } catch (error) {
      toast.error('Falha ao buscar operações');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operações Multi-Aposta</h1>
        <p className="text-gray-600 dark:text-gray-400">Visualize e gerencie suas operações complexas</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Operações ({operations.length})
        </h2>
        
        {operations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Nenhuma operação encontrada</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Crie operações multi-aposta na página de Registro de Apostas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {operations.map((operation) => (
              <div key={operation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Operação #{operation.id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tipo: <span className="font-medium">{operation.type}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Data: {new Date(operation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Exposição Total</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        R$ {(operation.total_exposure ?? operation.total_stake)?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Garantido</p>
                      <p className="text-xl font-bold text-green-600">
                        R$ {operation.guaranteed_profit?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bets in Operation */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Apostas na Operação</h4>
                  <div className="space-y-2">
                    {operation.bets?.map((bet, index) => (
                      <div key={bet.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Casa:</span>
                              <span className="ml-2 font-medium">{bet.bookmaker_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Evento:</span>
                              <span className="ml-2 font-medium">{bet.event}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Odds:</span>
                              <span className="ml-2 font-medium">{bet.odds}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Stake:</span>
                              <span className="ml-2 font-medium">R$ {bet.stake}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                bet.status === 'Won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                bet.status === 'Lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {bet.status === 'Won' ? 'Ganhou' : bet.status === 'Lost' ? 'Perdeu' : bet.status === 'Open' ? 'Aberta' : 'Cancelada'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operation Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lucro/Prejuízo Real</p>
                      <p className={`text-lg font-bold ${(operation.actual_profit_loss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {operation.actual_profit_loss?.toFixed(2) ?? '0.00'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nº de Apostas</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {operation.number_of_bets ?? (operation.bets?.length ?? 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        operation.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        operation.status === 'Open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {operation.status === 'Completed' ? 'Concluída' : operation.status === 'Open' ? 'Aberta' : 'Cancelada'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Operations;
