import React, { useEffect, useState } from 'react';

const Summary = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/transactions', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setTransactions(data || []))
      .catch((err) => console.error('Failed to fetch', err));
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((acc, cur) => acc + Number(cur.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((acc, cur) => acc + Number(cur.amount), 0);

  const balance = totalIncome - totalExpense;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

return (
  <div>
    <h3>Monthly Recap</h3>
    <div className="summary-container">
      <div className="summary-box">
        <h4>💰 Total Income:</h4>
        <div className="summary-value">{formatRupiah(totalIncome)}</div>
      </div>
      <div className="summary-box">
        <h4>🧾 Total Expenses:</h4>
        <div className="summary-value">{formatRupiah(totalExpense)}</div>
      </div>
      <div className="summary-box">
        <h4>💼 Current Balance:</h4>
        <div className="summary-value">{formatRupiah(balance)}</div>
      </div>
    </div>
  </div>
);
};

export default Summary;
