import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard({ authToken }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [pmForm, setPmForm] = useState({ type: 'card', details: '' });
  const [payForm, setPayForm] = useState({ paymentMethodId: '', amount: '', description: '' });

  useEffect(() => {
    axios.get('http://localhost:3000/api/payments/list', {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => setPaymentMethods(res.data.paymentMethods));

    axios.get('http://localhost:3000/api/payments/history', {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(res => setTransactions(res.data.transactions));
  }, [authToken, message]);

  // Add payment method
  const handlePmChange = e => setPmForm({ ...pmForm, [e.target.name]: e.target.value });
  const handlePmSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/payments/add', pmForm, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMessage('Payment method added!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add payment method');
    }
  };

  // Initiate payment
  const handlePayChange = e => setPayForm({ ...payForm, [e.target.name]: e.target.value });
  const handlePaySubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/payments/pay', {
        paymentMethodId: parseInt(payForm.paymentMethodId),
        amount: parseFloat(payForm.amount),
        description: payForm.description
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMessage('Payment initiated!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div>
      <h2>Your Payment Methods</h2>
      <ul>
        {paymentMethods.map(pm => (
          <li key={pm.id}>{pm.type}: {pm.details} (ID: {pm.id})</li>
        ))}
      </ul>
      <form onSubmit={handlePmSubmit}>
        <h3>Add Payment Method</h3>
        <select name="type" value={pmForm.type} onChange={handlePmChange}>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
        </select>
        <input name="details" placeholder="Details" value={pmForm.details} onChange={handlePmChange} required />
        <button type="submit">Add</button>
      </form>

      <h2>Your Transactions</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.amount} - {tx.status} ({tx.created_at}) {tx.description && `- ${tx.description}`}
          </li>
        ))}
      </ul>
      <form onSubmit={handlePaySubmit}>
        <h3>Initiate Payment</h3>
        <input
          name="paymentMethodId"
          placeholder="Payment Method ID"
          value={payForm.paymentMethodId}
          onChange={handlePayChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={payForm.amount}
          onChange={handlePayChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={payForm.description}
          onChange={handlePayChange}
        />
        <button type="submit">Pay</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default Dashboard;