import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Pizza, 
  Coffee, 
  Leaf, 
  IceCream, 
  Utensils, 
  Trash2, 
  Plus, 
  Sparkles,
  TrendingUp, 
  Activity,
  Calendar,
  Wallet
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Pizza', icon: <Pizza size={20} />, gradient: 'from-orange-400 to-red-500', shadow: 'shadow-orange-500/30' },
  { name: 'Burger', icon: <Utensils size={20} />, gradient: 'from-yellow-400 to-orange-500', shadow: 'shadow-yellow-500/30' },
  { name: 'Noodles', icon: <Utensils size={20} />, gradient: 'from-red-400 to-rose-600', shadow: 'shadow-red-500/30' },
  { name: 'Coffee', icon: <Coffee size={20} />, gradient: 'from-amber-600 to-amber-800', shadow: 'shadow-amber-700/30' },
  { name: 'Dessert', icon: <IceCream size={20} />, gradient: 'from-pink-400 to-purple-500', shadow: 'shadow-pink-500/30' },
  { name: 'Healthy', icon: <Leaf size={20} />, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30' },
];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Pizza',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    if (!supabase) {
      setLoading(false);
      setError("Connect Supabase to save and load your delicious data! 🚀");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError("Oops! Couldn't load your expenses.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category || !formData.expense_date) {
      alert("Please fill all fields to add a new bite!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!supabase) {
        // Demo Mode (Local State Only)
        const fakeExpense = {
          id: Math.random().toString(),
          title: formData.title,
          category: formData.category,
          amount: parseFloat(formData.amount),
          expense_date: formData.expense_date,
        };
        setExpenses(prev => [fakeExpense, ...prev]);
        setFormData({ ...formData, title: '', amount: '' });
        alert("Demo Mode: Expense added locally! Set up Supabase to save permanently.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('expenses')
        .insert([
          {
            title: formData.title,
            category: formData.category,
            amount: parseFloat(formData.amount),
            expense_date: formData.expense_date,
          }
        ]);

      if (error) throw error;

      setFormData({
        ...formData,
        title: '',
        amount: '',
      });
      
      fetchExpenses();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Failed to save expense: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    
    try {
      // Optimistic delete
      setExpenses(expenses.filter(e => e.id !== id));
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete.');
      fetchExpenses(); // rollback
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(item => Number(item.amount))) : 0;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthTotal = expenses
    .filter(item => {
      const date = new Date(item.expense_date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const getCategoryTheme = (categoryName) => {
    const category = CATEGORIES.find(c => c.name === categoryName);
    return category ? category : { icon: <Utensils size={20} />, gradient: 'from-gray-400 to-gray-600', shadow: 'shadow-gray-500/30' };
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-brand-purple/30 selection:text-brand-purple">
      
      {/* Dynamic Header */}
      <header className="pt-10 pb-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-purple/20 transform group-hover:rotate-12 transition-all duration-300">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                Munch Money
              </h1>
              <p className="text-sm text-gray-500 font-medium tracking-wide uppercase mt-1">
                Your Culinary Ledger
              </p>
            </div>
          </div>
          
          {/* Main Stat Pill */}
          <div className="glass-card px-6 py-4 flex items-center gap-5 hover:scale-105 transition-transform duration-300">
            <div className="p-3 bg-brand-green/10 text-brand-green rounded-xl">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">This Month</p>
              <p className="text-2xl font-black text-gray-900 leading-none">
                <span className="text-brand-green mr-1">$</span>
                {currentMonthTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6">
        {error && (
          <div className="glass-card bg-red-50/80 border-red-200 text-red-700 px-6 py-4 mb-8 flex items-center gap-3 animate-in slide-in-from-top-4">
            <Activity size={20} />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Stats */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Supercharged Form */}
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-brand-purple/20 duration-500" />
              
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-brand-orange text-white p-1.5 rounded-lg">
                  <Plus size={18} strokeWidth={3} />
                </span>
                Log a Craving
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">What did you eat?</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Spicy Ramen Bowl"
                    className="w-full px-5 py-3.5 glass-input text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-all duration-300 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Cost ($)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full px-5 py-3.5 glass-input text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Date</label>
                    <input
                      type="date"
                      name="expense_date"
                      value={formData.expense_date}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 glass-input text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Vibe / Category</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES.map(cat => (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.name }))}
                        className={`
                          py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border
                          ${formData.category === cat.name 
                            ? `bg-gradient-to-br ${cat.gradient} text-white shadow-lg ${cat.shadow} border-transparent scale-105` 
                            : 'bg-white/50 text-gray-600 border-white/60 hover:bg-white hover:shadow-sm'}
                        `}
                      >
                        {cat.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wide">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-gray-900/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Add to Ledger <Sparkles size={18} /></>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 hover:-translate-y-1 transition-transform duration-300">
                 <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-3">
                   <TrendingUp size={20} />
                 </div>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Spent</p>
                 <p className="text-xl font-black text-gray-900">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="glass-card p-5 hover:-translate-y-1 transition-transform duration-300">
                 <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-3">
                   <Activity size={20} />
                 </div>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Max Splurge</p>
                 <p className="text-xl font-black text-gray-900">${highestExpense.toFixed(2)}</p>
              </div>
            </div>
            
          </div>

          {/* Right Column: Dynamic Feed */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 min-h-[700px] flex flex-col">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Bites</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Your latest gastronomic adventures</p>
                </div>
                <div className="bg-white/80 backdrop-blur px-4 py-1.5 rounded-full border border-white/60 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  <span className="text-xs font-bold text-gray-700">{expenses.length} Entries</span>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col justify-center items-center opacity-50">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-purple rounded-full animate-spin mb-4" />
                  <p className="font-semibold text-gray-500 animate-pulse">Brewing your data...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                  <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center shadow-xl">
                      <Utensils size={40} className="text-brand-orange" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">The plate is empty!</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    Time to treat yourself. Add your first meal on the left to start tracking your food journey.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {expenses.map((expense, i) => {
                    const theme = getCategoryTheme(expense.category);
                    return (
                      <div 
                        key={expense.id} 
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/40 border border-white/60 hover:bg-white hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-lg ${theme.shadow} transform group-hover:scale-110 transition-transform duration-300`}>
                            {theme.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{expense.title}</h3>
                            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                              <span className="uppercase tracking-wider">{expense.category}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(expense.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-4 sm:mt-0 pl-19 sm:pl-0">
                          <div className="text-right">
                            <span className="block text-2xl font-black text-gray-900">${Number(expense.amount).toFixed(2)}</span>
                          </div>
                          <button 
                            onClick={() => handleDelete(expense.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 active:scale-90"
                            aria-label="Delete expense"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
