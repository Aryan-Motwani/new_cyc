import React, { useState } from 'react';

const RazorpayPayment = () => {
  const [amount, setAmount] = useState('');

  const handlePayment = () => {
    const options = {
      key: 'RjYIl0Ivc08iJi', // Replace with your Razorpay key ID
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Test Payment',
      description: 'Test Transaction',
      handler: function (response) {
        alert('Payment Successful: ' + response.razorpay_payment_id);
      },
      prefill: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#F37254',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      <h2>Razorpay Test Payment</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={handlePayment}>Pay</button>
    </div>
  );
};

export default RazorpayPayment;
