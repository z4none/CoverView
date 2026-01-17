import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import Header from './Header';
import { format } from 'date-fns';

const Profile = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    useEffect(() => {
        if (user) {
            fetchCredits();
            fetchTransactions();
        }
    }, [user, page]);

    const fetchCredits = async () => {
        const { data, error } = await supabase
            .from('user_usage')
            .select('credits')
            .eq('user_id', user.id)
            .single();

        if (data) setCredits(data.credits);
    };

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (data) {
            if (data.length < PAGE_SIZE) setHasMore(false);
            setTransactions(prev => page === 0 ? data : [...prev, ...data]);
        }
        setIsLoading(false);
    };

    if (!user) return <div className="text-center mt-20">Please login first</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-Nunito">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 概览卡片 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center md:text-left md:flex md:items-center md:justify-between animate-fade-in-up">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">👋 Welcome back, {user.email?.split('@')[0]}</h2>
                        <p className="text-gray-500">Check your account balance and usage history</p>
                    </div>
                    <div className="mt-6 md:mt-0 bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 flex flex-col items-center">
                        <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Remaining Credits</span>
                        <span className="text-4xl font-extrabold text-blue-600 mt-1">{credits}</span>
                    </div>
                </div>

                {/* 交易记录列表 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">📊 Transaction History</h3>
                    </div>

                    {isLoading && page === 0 ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No records found
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount < 0 ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'
                                            }`}>
                                            {tx.amount < 0 ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{tx.description || (tx.amount < 0 ? 'Spend' : 'Top-up')}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.amount < 0 ? 'text-gray-800' : 'text-green-600'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Balance: {tx.balance_after}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && (
                        <div className="p-4 text-center border-t border-gray-50">
                            <button
                                onClick={() => setPage(p => p + 1)}
                                className="text-sm text-blue-500 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
                            >
                                Load more transactions
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
