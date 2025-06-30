import React, { useEffect, useState } from 'react';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/transactions', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Dari backend:", data); 
        setTransactions(data);
      })
      .catch((err) => console.error('Failed to fetch', err));
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDateTime = (datetimeString) => {
    const date = new Date(datetimeString);

    const options = {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    return date.toLocaleString('id-ID', options); 
  };

  const getRowClassName = (type) => {
    const className = type === 'Income' ? 'transaction-income' : 'transaction-expense';
    console.log(`Transaction type: ${type}, Class: ${className}`); // Debug line
    return className;
  };

  return (
    <div>
      <h2>Transaction History</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Dates</th>
            <th>Types</th>
            <th>Total</th>
            <th>Categories</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada transaksi.</td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr
                key={index}
                className={getRowClassName(transaction.type)}
              >
                <td>{formatDateTime(transaction.date)}</td>
                <td>{transaction.type}</td>
                <td>{formatRupiah(transaction.amount)}</td>
                <td>{transaction.category}</td>
                <td>{transaction.description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;