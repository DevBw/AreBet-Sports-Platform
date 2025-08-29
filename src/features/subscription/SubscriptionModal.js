// ===============================================
// SUBSCRIPTION MODAL COMPONENT
// Stripe-powered subscription upgrade modal
// ===============================================

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../shared/hooks/useAuth';
import { Button, Card } from '../../shared/components';

const SubscriptionModal = ({ isOpen, onClose, defaultTier = 'pro' }) => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const subscriptionPlans = {
    pro: {
      name: 'Pro Bettor',
      icon: '⚡',
      gradient: 'from-cyan-500 to-blue-500',
      monthly: { price: 9.99, priceId: 'price_pro_monthly' },
      yearly: { price: 99.99, priceId: 'price_pro_yearly', savings: '17%' },
      features: [
        'AI-powered match predictions',
        'Advanced team statistics',
        'Injury impact analysis',
        'Real-time notifications',
        'Historical H2H data',
        'Form analysis charts'
      ],
      popular: true
    },
    elite: {
      name: 'Elite Analytics',
      icon: '🎯',
      gradient: 'from-amber-500 to-orange-500',
      monthly: { price: 29.99, priceId: 'price_elite_monthly' },
      yearly: { price: 299.99, priceId: 'price_elite_yearly', savings: '17%' },
      features: [
        'Everything in Pro',
        'Value bet detection',
        'Custom alert system',
        'Historical trend analysis',
        'Advanced API access',
        'Priority support',
        'White-label analytics'
      ],
      popular: false
    }
  };

  const handleSubscribe = async (tier) => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would integrate with Stripe
      // For demo purposes, we'll simulate the process
      
      const plan = subscriptionPlans[tier];
      const priceInfo = plan[billingCycle];
      
      // Simulate Stripe checkout
      const checkoutData = {
        priceId: priceInfo.priceId,
        userId: user.id,
        email: user.email,
        tier: tier,
        billingCycle: billingCycle
      };

      console.log('Starting checkout process:', checkoutData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would redirect to Stripe Checkout
      alert(`🎉 Subscription process started!\n\nTier: ${plan.name}\nPrice: $${priceInfo.price}/${billingCycle.slice(0, -2)}\n\nIn production, this would redirect to Stripe Checkout.`);
      
      onClose();
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative z-50 w-full max-w-4xl">
          <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Upgrade to Premium
                  </h2>
                  <p className="text-indigo-100">
                    Unlock advanced betting insights and AI-powered analytics
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Billing Cycle Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-md font-medium transition-all relative ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans */}
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(subscriptionPlans).map(([tier, plan]) => {
                  const priceInfo = plan[billingCycle];
                  const isSelected = selectedTier === tier;
                  
                  return (
                    <div
                      key={tier}
                      className={`
                        relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300
                        ${isSelected 
                          ? `border-transparent bg-gradient-to-br ${plan.gradient.replace('from-', 'from-').replace('to-', 'to-')} bg-opacity-10 ring-2 ring-blue-500` 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => setSelectedTier(tier)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-2xl mb-4`}>
                          {plan.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          ${priceInfo.price}
                          <span className="text-lg text-gray-600 font-normal">
                            /{billingCycle.slice(0, -2)}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && priceInfo.savings && (
                          <div className="text-green-600 font-medium">
                            Save {priceInfo.savings}
                          </div>
                        )}
                      </div>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            </span>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={isSelected ? 'premium' : 'outline'}
                        size="large"
                        className="w-full"
                        onClick={() => handleSubscribe(tier)}
                        loading={loading && isSelected}
                        disabled={loading}
                      >
                        {loading && isSelected ? 'Processing...' : `Choose ${plan.name}`}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  All plans include a 7-day free trial. Cancel anytime.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>🔒 Secure payment with Stripe</span>
                  <span>•</span>
                  <span>📧 Email support included</span>
                  <span>•</span>
                  <span>🔄 30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

SubscriptionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  defaultTier: PropTypes.oneOf(['pro', 'elite'])
};

export default SubscriptionModal;