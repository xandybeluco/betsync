import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Trophy,
  Activity,
  Wallet,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, change, icon: Icon, color = 'primary', trend = null }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : value}
          </p>
          {change !== undefined && change !== null && (
            <div className={`flex items-center mt-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              {Math.abs(change).toFixed(2)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          color === 'success' ? 'bg-green-100 dark:bg-green-900' :
          color === 'danger' ? 'bg-red-100 dark:bg-red-900' :
          color === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
          'bg-blue-100 dark:bg-blue-900'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'success' ? 'text-green-600 dark:text-green-400' :
            color === 'danger' ? 'text-red-600 dark:text-red-400' :
            color === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-blue-600 dark:text-blue-400'
          }`} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [bankrollHistory, setBankrollHistory] = useState([]);
  const [recentBets, setRecentBets] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, historyRes, recentBetsRes, performanceRes] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getBankrollHistory(days),
        dashboardAPI.getRecentBets(10),
        dashboardAPI.getPerformance(days)
      ]);

      setOverview(overviewRes.data);
      setBankrollHistory(historyRes.data || []);
      setRecentBets(recentBetsRes.data || []);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Falha ao carregar dados do painel');
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

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Nenhum dado disponível. Verifique se o servidor está rodando.</p>
      </div>
    );
  }

  const currBankroll = Number(overview.current_bankroll) || 0;
  const initialBankroll = Number(overview.initial_bankroll) || 1000;
  const totalPL = Number(overview.total_profit_loss) || 0;
  const dailyProfit = Number(overview.daily_profit) || 0;
  const monthlyProfit = Number(overview.monthly_profit) || 0;
  const roi = Number(overview.roi) || 0;
  const totalBets = Number(overview.total_bets) || 0;
  const winRate = Number(overview.win_rate) || 0;
  const wonBets = Number(overview.won_bets) || 0;
  const lostBets = Number(overview.lost_bets) || 0;
  const openBets = Number(overview.open_bets) || 0;
  const totalStaked = Number(overview.total_staked) || 0;
  const totalExposure = Number(overview.total_exposure) || 0;

  const profitMargin = totalStaked > 0 ? (totalPL / totalStaked) * 100 : 0;
  const bankrollGrowth = initialBankroll > 0 ? ((currBankroll - initialBankroll) / initialBankroll) * 100 : 0;

  // Prepare pie chart data for win/loss distribution
  const winLossData = [
    { name: 'Ganhas', value: wonBets, fill: '#22c55e' },
    { name: 'Perdidas', value: lostBets, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel</h1>
          <p className="text-gray-600 dark:text-gray-400">Visão geral do seu desempenho nas apostas</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Período:</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="select"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
          </select>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Banca Atual"
          value={`R$ ${currBankroll.toFixed(2)}`}
          change={bankrollGrowth}
          icon={Wallet}
          color={currBankroll >= initialBankroll ? 'success' : 'danger'}
        />
        <StatCard
          title="Lucro/Prejuízo Total"
          value={`R$ ${totalPL.toFixed(2)}`}
          change={roi}
          icon={TrendingUp}
          color={totalPL >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="ROI"
          value={`${roi.toFixed(2)}%`}
          icon={Activity}
          color={roi >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Taxa de Acerto"
          value={`${winRate.toFixed(1)}%`}
          icon={Trophy}
          color={winRate >= 50 ? 'success' : 'warning'}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lucro Diário"
          value={`R$ ${dailyProfit.toFixed(2)}`}
          icon={Calendar}
          color={dailyProfit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Lucro Mensal"
          value={`R$ ${monthlyProfit.toFixed(2)}`}
          icon={Target}
          color={monthlyProfit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Total de Apostas"
          value={totalBets}
          icon={Eye}
          color="primary"
        />
        <StatCard
          title="Apostas em Aberto"
          value={openBets}
          icon={Activity}
          color={openBets > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bankroll Evolution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evolução da Banca</h2>
          {bankrollHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bankrollHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Banca']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bankroll" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              Sem dados disponíveis
            </div>
          )}
        </div>

        {/* Win/Loss Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição de Resultados</h2>
          {totalBets > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} apostas`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              Sem dados disponíveis
            </div>
          )}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Bet Type */}
        {performance?.by_bet_type && performance.by_bet_type.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Desempenho por Tipo de Aposta</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance.by_bet_type}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="bet_type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Lucro/Prejuízo']}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar 
                  dataKey="total_profit_loss" 
                  fill="#3b82f6"
                  shape={(props) => {
                    const { x, y, width, height, value } = props;
                    return (
                      <rect
                        x={x}
                        y={value >= 0 ? y : y + height}
                        width={width}
                        height={Math.abs(height)}
                        fill={value >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance by Bookmaker */}
        {performance?.by_bookmaker && performance.by_bookmaker.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Desempenho por Casa de Apostas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance.by_bookmaker}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="bookmaker" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Lucro/Prejuízo']}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar 
                  dataKey="total_profit_loss" 
                  fill="#3b82f6"
                  shape={(props) => {
                    const { x, y, width, height, value } = props;
                    return (
                      <rect
                        x={x}
                        y={value >= 0 ? y : y + height}
                        width={width}
                        height={Math.abs(height)}
                        fill={value >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Bets Table */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apostas Recentes</h2>
        {recentBets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Evento</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Casa</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Odds</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Stake</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">L/P</th>
                </tr>
              </thead>
              <tbody>
                {recentBets.map((bet) => (
                  <tr key={bet.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 text-sm">{new Date(bet.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4 text-sm font-medium">{bet.event}</td>
                    <td className="py-3 px-4 text-sm">{bet.bookmaker_name}</td>
                    <td className="py-3 px-4 text-sm">{bet.bet_type}</td>
                    <td className="py-3 px-4 text-sm font-medium">{bet.odds}</td>
                    <td className="py-3 px-4 text-sm">R$ {bet.stake.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bet.status === 'Won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        bet.status === 'Lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {bet.status === 'Won' ? 'Ganhou' : bet.status === 'Lost' ? 'Perdeu' : 'Aberta'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      <span className={(bet.profit_loss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {(bet.profit_loss ?? 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Nenhuma aposta encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
