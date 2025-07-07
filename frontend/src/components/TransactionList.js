import React, { useEffect, useState } from 'react';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: '',
    amount: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetch('http://localhost:4000/transactions', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setTransactions(data || []))
      .catch((err) => console.error('Failed to fetch', err));
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatWithDots = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatDots = (value) => {
    return value.replace(/\./g, "");
  };

  const getRowClassName = (type) => {
    return type === 'Income' ? 'transaction-income' : 'transaction-expense';
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      fetch(`http://localhost:4000/transactions/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => res.json())
        .then(() => {
          setTransactions(transactions.filter((t) => t.id !== id));
        })
        .catch((err) => {
          console.error("Delete failed:", err);
        });
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description
    });
  };

  const handleSave = async (id) => {
    const res = await fetch(`http://localhost:4000/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...editForm,
        amount: unformatDots(editForm.amount)
      }),
    });

    if (res.ok) {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, ...editForm, amount: parseInt(unformatDots(editForm.amount)) } : t
      );
      setTransactions(updated);
      setEditingId(null);
    } else {
      alert("Failed to update transaction");
    }
  };

  const getCategories = (type) =>
    type === "Income"
      ? ["Salary", "Gift", "Other"]
      : ["Food", "Transport", "Groceries", "Rent", "Bill", "Other"];

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No Transaction Yet</td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr
                key={index}
                className={
                  editingId === transaction.id
                    ? getRowClassName(editForm.type)
                    : getRowClassName(transaction.type)
                }
              >
                <td>{formatDateTime(transaction.date)}</td>
                <td>
                  {editingId === transaction.id ? (
                    <select
                      value={editForm.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const newCategories = getCategories(newType);
                        setEditForm((prev) => ({
                          ...prev,
                          type: newType,
                          category: newCategories.includes(prev.category)
                            ? prev.category
                            : newCategories[0]
                        }));
                      }}
                    >
                      <option>Income</option>
                      <option>Expense</option>
                    </select>
                  ) : (
                    transaction.type
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="text"
                      value={formatWithDots(editForm.amount)}
                      onChange={(e) => {
                        const raw = unformatDots(e.target.value);
                        if (!isNaN(raw)) {
                          setEditForm({ ...editForm, amount: raw });
                        }
                      }}
                    />
                  ) : (
                    formatRupiah(transaction.amount)
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {getCategories(editForm.type).map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    transaction.category
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  ) : (
                    transaction.description
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <>
                      <button onClick={() => handleSave(transaction.id)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(transaction)}>Edit</button>
                      <button onClick={() => handleDelete(transaction.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
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

export default TransactionList;
