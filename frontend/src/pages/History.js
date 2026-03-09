import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, X } from 'lucide-react';
import { betsAPI, bookmakersAPI } from '../services/api';
import toast from 'react-hot-toast';

const History = () => {
  const [bets, setBets] = useState([]);
  const [bookmakers, setBookmakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    bookmaker_id: '',
    status: '',
    bet_type: '',
    operation_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchBets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchData = async () => {
    try {
      const bookmakersRes = await bookmakersAPI.getAll();
      setBookmakers(bookmakersRes.data || []);
    } catch (error) {
      console.error('Error fetching bookmakers:', error);
      toast.error('Falha ao buscar casas de apostas');
    } finally {
      setLoading(false);
    }
  };

  const fetchBets = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const response = await betsAPI.getAll(activeFilters);
      setBets(response.data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
      toast.error('Falha ao buscar apostas');
    } finally {
      setLoading(false);
    }
  };

  const updateBetStatus = async (betId, newStatus) => {
    try {
      await betsAPI.update(betId, { status: newStatus });
      toast.success('Status da aposta atualizado com sucesso');
      fetchBets();
    } catch (error) {
      console.error('Error updating bet:', error);
      toast.error('Falha ao atualizar status da aposta');
    }
  };

  const deleteBet = async (betId) => {
    if (window.confirm('Tem certeza que deseja excluir esta aposta?')) {
      try {
        await betsAPI.delete(betId);
        toast.success('Aposta excluída com sucesso');
        fetchBets();
      } catch (error) {
        console.error('Error deleting bet:', error);
        toast.error('Falha ao excluir aposta');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      bookmaker_id: '',
      status: '',
      bet_type: '',
      operation_id: ''
    });
  };

  const exportToCSV = () => {
    if (bets.length === 0) {
      toast.error('Nenhuma aposta para exportar');
      return;
    }

    const headers = ['Data', 'Casa', 'Tipo', 'Evento', 'Mercado', 'Odds', 'Stake', 'Retorno', 'Status', 'L/P'];
    const rows = bets.map(bet => [
      new Date(bet.date).toLocaleDateString('pt-BR'),
      bet.bookmaker_name || '-',
      bet.bet_type || '-',
      bet.event || '-',
      bet.market || '-',
      bet.odds || '-',
      bet.stake?.toFixed(2) || '0.00',
      bet.potential_return?.toFixed(2) || '0.00',
      bet.status || '-',
      bet.profit_loss?.toFixed(2) || '0.00'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apostas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Apostas exportadas com sucesso');
  };

  // Pagination
  const totalPages = Math.ceil(bets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBets = bets.slice(startIndex, endIndex);

  // Calculate statistics
  const stats = {
    total: bets.length,
    won: bets.filter(b => b.status === 'Won').length,
    lost: bets.filter(b => b.status === 'Lost').length,
    open: bets.filter(b => b.status === 'Open').length,
    totalStaked: bets.reduce((sum, b) => sum + (b.stake || 0), 0),
    totalProfit: bets.reduce((sum, b) => sum + (b.profit_loss || 0), 0),
    winRate: bets.length > 0 ? (bets.filter(b => b.status === 'Won').length / bets.length * 100) : 0
  };

  if (loading && bookmakers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Histórico de Apostas</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize e filtre seu histórico de apostas</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ganhas</p>
          <p className="text-2xl font-bold text-green-600">{stats.won}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Perdidas</p>
          <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Abertas</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Taxa Acerto</p>
          <p className="text-2xl font-bold text-blue-600">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Apostado</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">R$ {stats.totalStaked.toFixed(0)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lucro/Prejuízo</p>
          <p className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {stats.totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Data Inicial</label>
              <input
                type="date"
                className="input"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Data Final</label>
              <input
                type="date"
                className="input"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Casa de Apostas</label>
              <select
                className="select"
                value={filters.bookmaker_id}
                onChange={(e) => setFilters(prev => ({ ...prev, bookmaker_id: e.target.value }))}
              >
                <option value="">Todas as Casas</option>
                {bookmakers.map((bookmaker) => (
                  <option key={bookmaker.id} value={bookmaker.id}>
                    {bookmaker.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tipo de Aposta</label>
              <select
                className="select"
                value={filters.bet_type}
                onChange={(e) => setFilters(prev => ({ ...prev, bet_type: e.target.value }))}
              >
                <option value="">Todos os Tipos</option>
                <option value="Aposta Simples">Aposta Simples</option>
                <option value="Super Odd">Super Odd</option>
                <option value="Aumentada">Aumentada</option>
                <option value="Tentativa de Duplo">Tentativa de Duplo</option>
                <option value="Free Bet">Free Bet</option>
                <option value="Extração de FreeBet">Extração de FreeBet</option>
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos Status</option>
                <option value="Open">Aberta</option>
                <option value="Won">Ganhou</option>
                <option value="Lost">Perdeu</option>
                <option value="Cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="label">ID da Operação</label>
              <input
                type="text"
                className="input"
                value={filters.operation_id}
                onChange={(e) => setFilters(prev => ({ ...prev, operation_id: e.target.value }))}
                placeholder="ID da Operação"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={clearFilters}
              className="btn btn-outline"
            >
              Limpar Filtros
            </button>
            <button
              onClick={exportToCSV}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Bets Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Apostas ({bets.length})
          </h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Por página:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="select text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Nenhuma aposta encontrada</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Casa</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Evento</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Mercado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Odds</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Stake</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Retorno</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">L/P</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBets.map((bet) => (
                    <tr key={bet.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{new Date(bet.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 font-medium">{bet.bookmaker_name || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
                          {bet.bet_type || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{bet.event || '-'}</td>
                      <td className="py-3 px-4">{bet.market || '-'}</td>
                      <td className="py-3 px-4 font-medium">{bet.odds || '-'}</td>
                      <td className="py-3 px-4">R$ {bet.stake?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4">R$ {bet.potential_return?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4">
                        <select
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                          value={bet.status}
                          onChange={(e) => updateBetStatus(bet.id, e.target.value)}
                        >
                          <option value="Open">Aberta</option>
                          <option value="Won">Ganhou</option>
                          <option value="Lost">Perdeu</option>
                          <option value="Cancelled">Cancelada</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <span className={bet.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}>
                          R$ {bet.profit_loss?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deleteBet(bet.id)}
                          className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, bets.length)} de {bets.length} apostas
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
