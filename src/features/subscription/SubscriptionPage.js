// ===============================================
// SUBSCRIPTION MANAGEMENT PAGE
// User subscription dashboard and billing management
// ===============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { Header, Card, Button, PremiumBadge } from '../../shared/components';
import SubscriptionModal from './SubscriptionModal';

const SubscriptionPage = () => {
  const { user, userProfile, subscriptionTier, isPremium, getSubscriptionLimits } = useAuth();
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [usage, setUsage] = useState({ apiCalls: 0, quota: 100 });

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]); // loadSubscriptionData is defined inline so doesn't need dependency

  const loadSubscriptionData = async () => {
    // Load user's subscription data, billing history, and usage
    const limits = getSubscriptionLimits();
    
    // Mock data for demo
    setUsage({
      apiCalls: userProfile?.api_quota_used || 0,
      quota: limits.apiQuota
    });

    setBillingHistory([
      {
        id: 1,
        date: '2024-01-15',
        amount: 9.99,
        status: 'paid',
        plan: 'Pro Bettor',
        invoice: 'inv_1234567890'
      },
      {
        id: 2,
        date: '2023-12-15',
        amount: 9.99,
        status: 'paid',
        plan: 'Pro Bettor',
        invoice: 'inv_0987654321'
      }
    ]);
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing period.')) {
      try {
        // In production, this would call your backend to cancel via Stripe
        alert('Subscription cancelled. You\'ll retain access until the end of your billing period.');
      } catch (error) {
        alert('Failed to cancel subscription. Please contact support.');
      }
    }
  };


  const getTierConfig = () => {
    const configs = {
      free: {
        name: 'Free',
        icon: '🆓',
        gradient: 'from-gray-400 to-gray-500',
        features: ['Basic scores', 'Basic fixtures', 'Basic standings']
      },
      pro: {
        name: 'Pro Bettor',
        icon: '⚡',
        gradient: 'from-cyan-500 to-blue-500',
        features: ['AI predictions', 'Advanced stats', 'Real-time alerts', 'Historical data']
      },
      elite: {
        name: 'Elite Analytics',
        icon: '🎯',
        gradient: 'from-amber-500 to-orange-500',
        features: ['Everything in Pro', 'Value bet detection', 'Custom alerts', 'Priority support']
      }
    };

    return configs[subscriptionTier] || configs.free;
  };

  const config = getTierConfig();
  const usagePercentage = Math.round((usage.apiCalls / usage.quota) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Subscription Management
          </h1>
          <p className="text-gray-600">
            Manage your subscription, view usage, and billing information
          </p>
        </div>

        {/* Current Plan */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center text-2xl`}>
                {config.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{config.name}</h2>
                  {isPremium && <PremiumBadge tier={subscriptionTier} />}
                </div>
                <p className="text-gray-600">
                  {isPremium ? 'Active subscription' : 'Free plan'}
                </p>
              </div>
            </div>

            {!isPremium && (
              <Button
                variant="premium"
                onClick={() => setSubscriptionModal(true)}
              >
                Upgrade Now
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Plan Features</h3>
              <ul className="space-y-2">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">API Usage</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>API Calls This Month</span>
                  <span>{usage.apiCalls} / {usage.quota}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage > 80 ? 'bg-red-500' : 
                      usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Resets monthly. {usage.quota - usage.apiCalls} calls remaining.
              </p>
            </div>
          </div>

          {/* Plan Actions */}
          {isPremium && (
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSubscriptionModal(true)}
              >
                Change Plan
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancelSubscription}
                className="text-red-600 hover:text-red-700"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </Card>

        {/* Billing Information */}
        {isPremium && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Next Billing Date</h4>
                <p className="text-gray-700">February 15, 2024</p>
                <p className="text-sm text-gray-500">$9.99 will be charged</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">•••• •••• •••• 4242</span>
                  <span className="text-sm text-gray-500">Expires 12/25</span>
                </div>
                <Button variant="ghost" size="small" className="mt-1 text-indigo-600">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Billing History */}
        {isPremium && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Billing History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((bill) => (
                    <tr key={bill.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(bill.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{bill.plan}</td>
                      <td className="py-3 px-4 text-gray-700">${bill.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="small" className="text-indigo-600">
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Free Plan CTA */}
        {!isPremium && (
          <Card className="p-8 text-center bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Upgrade?
            </h3>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Unlock AI-powered predictions, advanced analytics, and premium insights to make better betting decisions.
            </p>
            <Button
              variant="premium"
              size="large"
              onClick={() => setSubscriptionModal(true)}
            >
              View Premium Plans
            </Button>
          </Card>
        )}
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModal}
        onClose={() => setSubscriptionModal(false)}
        defaultTier={subscriptionTier === 'free' ? 'pro' : 'elite'}
      />
    </div>
  );
};

export default SubscriptionPage;