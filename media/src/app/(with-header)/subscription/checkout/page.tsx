'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PLANS = {
  artist: {
    name: 'Artist',
    yearly: { total: 359.88, monthly: 29.99 },
    monthly: { total: 59.99, monthly: 59.99 },
  },
  'artist-pro': {
    name: 'Artist Pro',
    yearly: { total: 899.88, monthly: 74.99 },
    monthly: { total: 149.99, monthly: 149.99 },
  },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = (searchParams.get('plan') ?? 'artist-pro') as keyof typeof PLANS;
  const plan = PLANS[planKey] ?? PLANS['artist-pro'];

  const [billing, setBilling] = useState<'yearly' | 'monthly'>('yearly');
  const [payment, setPayment] = useState<'apple' | 'card' | 'paypal' | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [addBillingAddress, setAddBillingAddress] = useState(false);

  const price = billing === 'yearly' ? plan.yearly : plan.monthly;

  const renewDate = billing === 'yearly' ? 'Apr 25, 2027' : 'May 25, 2026';

  function handleBuy() {
    router.push(`/subscription/success?plan=${planKey}`);
  }

  return (
    <div className="min-h-screen bg-white text-black px-12 py-10">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-10">Get {plan.name}</h1>

      <div className="flex gap-16">
        {/* LEFT */}
        <div className="flex-1 max-w-xl">

          {/* 1. Billing cycle */}
          <h2 className="text-lg font-bold mb-4">1. Billing cycle</h2>

          {/* Yearly */}
          <div
            onClick={() => setBilling('yearly')}
            className={`flex items-center justify-between border rounded-lg px-5 py-4 mb-3 cursor-pointer ${billing === 'yearly' ? 'border-[#e84a25] border-2' : 'border-gray-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billing === 'yearly' ? 'border-[#e84a25]' : 'border-gray-400'}`}>
                {billing === 'yearly' && <div className="w-2.5 h-2.5 rounded-full bg-[#e84a25]" />}
              </div>
              <div>
                <p className="font-semibold text-sm">Yearly billing</p>
                <p className="text-xs text-gray-500">EGP {plan.yearly.total}, that&apos;s EGP {plan.yearly.monthly}/month</p>
              </div>
            </div>
            <span className="bg-[#e84a25] text-white text-xs font-bold px-2 py-1 rounded">50% YEARLY DISCOUNT</span>
          </div>

          {/* Monthly */}
          <div
            onClick={() => setBilling('monthly')}
            className={`flex items-center gap-3 border rounded-lg px-5 py-4 mb-8 cursor-pointer ${billing === 'monthly' ? 'border-[#e84a25] border-2' : 'border-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billing === 'monthly' ? 'border-[#e84a25]' : 'border-gray-400'}`}>
              {billing === 'monthly' && <div className="w-2.5 h-2.5 rounded-full bg-[#e84a25]" />}
            </div>
            <div>
              <p className="font-semibold text-sm">Monthly billing</p>
              <p className="text-xs text-gray-500">EGP {plan.monthly.monthly}/month</p>
            </div>
          </div>

          {/* 2. Payment details */}
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            2. Payment details <span className="text-gray-400 text-base">🔒</span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">Add new payment methods</p>

          {/* Apple Pay */}
          <div
            onClick={() => setPayment('apple')}
            className={`border rounded-lg px-5 py-4 mb-3 cursor-pointer ${payment === 'apple' ? 'border-[#e84a25] border-2' : 'border-gray-300'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'apple' ? 'border-[#e84a25]' : 'border-gray-400'}`}>
                  {payment === 'apple' && <div className="w-2.5 h-2.5 rounded-full bg-[#e84a25]" />}
                </div>
                <span className="font-medium text-sm">Apple Pay</span>
              </div>
              <span className="border border-gray-300 rounded px-2 py-0.5 text-xs font-bold">Apple Pay</span>
            </div>
          </div>

          {/* Card */}
          <div
            onClick={() => setPayment('card')}
            className={`border rounded-lg px-5 py-4 mb-3 cursor-pointer ${payment === 'card' ? 'border-[#e84a25] border-2' : 'border-gray-300'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'card' ? 'border-[#e84a25]' : 'border-gray-400'}`}>
                  {payment === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-[#e84a25]" />}
                </div>
                <span className="font-medium text-sm">Card</span>
              </div>
              <div className="flex gap-1">
                {['VISA', 'MC', 'AMEX', '💳', 'JCB', '🏦'].map((c) => (
                  <span key={c} className="border border-gray-200 rounded px-1 text-xs">{c}</span>
                ))}
              </div>
            </div>

            {/* Card fields expand */}
            {payment === 'card' && (
              <div className="mt-4 flex flex-col gap-3">
                <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm w-full bg-gray-50 outline-none" placeholder="First name" />
                <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm w-full bg-gray-50 outline-none" placeholder="Last name" />
                <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm w-full bg-gray-50 outline-none" placeholder="Card number" />
                <div className="flex gap-3">
                  <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm flex-1 bg-gray-50 outline-none" placeholder="Expiration month" />
                  <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm flex-1 bg-gray-50 outline-none" placeholder="Expiration year" />
                  <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm w-24 bg-gray-50 outline-none" placeholder="CVV" />
                </div>
                <select className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none">
                  <option>Egypt</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
                <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none" placeholder="Postcode (optional)" />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={addBillingAddress} onChange={(e) => setAddBillingAddress(e.target.checked)} className="w-4 h-4" />
                  Add billing address (visible on invoice)
                </label>
              </div>
            )}
          </div>

          {/* PayPal */}
          <div
            onClick={() => setPayment('paypal')}
            className={`border rounded-lg px-5 py-4 cursor-pointer ${payment === 'paypal' ? 'border-[#e84a25] border-2' : 'border-gray-300'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'paypal' ? 'border-[#e84a25]' : 'border-gray-400'}`}>
                  {payment === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-[#e84a25]" />}
                </div>
                <span className="font-medium text-sm">PayPal</span>
              </div>
              <span className="text-[#003087] font-bold text-lg">P</span>
            </div>

            {/* PayPal fields expand */}
            {payment === 'paypal' && (
              <div className="mt-4 flex flex-col gap-3">
                <select className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none">
                  <option>Egypt</option>
                  <option>United States</option>
                </select>
                <input className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none" placeholder="Postcode (optional)" />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={addBillingAddress} onChange={(e) => setAddBillingAddress(e.target.checked)} className="w-4 h-4" />
                  Add billing address (visible on invoice)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — sticky review */}
        <div className="w-80 shrink-0">
          <h2 className="text-lg font-bold mb-4">3. Review your purchase</h2>

          {/* Plan */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl">☁</div>
            <span className="font-semibold">{plan.name}</span>
          </div>

          {/* Coupon */}
          {!showCoupon ? (
            <button onClick={() => setShowCoupon(true)} className="text-blue-500 text-sm hover:underline mb-4 block">
              Do you have a coupon code?
            </button>
          ) : (
            <div className="flex gap-2 mb-4">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none"
              />
              <button className="rounded-full bg-black text-white px-5 py-3 text-sm font-bold hover:bg-gray-800 transition-colors">
                Apply
              </button>
            </div>
          )}

          {/* Summary box */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-3">
              <span className="font-bold text-sm">Total</span>
              <span className="font-bold text-sm">EGP {price.total}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="font-bold text-sm">Billing cycle</span>
              <span className="text-sm">{billing === 'yearly' ? 'Yearly' : 'Monthly'}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">
              Subscription will automatically renew at EGP {price.total} every {billing === 'yearly' ? 'year' : 'month'}, starting {renewDate}, unless you cancel before the day of your next renewal in your subscription settings.
            </p>
            <p className="text-xs text-gray-500">All prices in EGP</p>
          </div>

          {/* Buy button */}
          <button
            onClick={handleBuy}
            className={`w-full rounded-lg py-4 text-sm font-bold text-white transition-colors mb-3 ${
              payment === 'paypal'
                ? 'bg-[#003087] hover:bg-[#002070]'
                : payment === 'apple'
                ? 'bg-black hover:bg-gray-900'
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            {payment === 'paypal'
              ? '🅿 Continue with PayPal'
              : payment === 'apple'
              ? ' Continue with Apple Pay'
              : 'Buy subscription'}
          </button>

          <p className="text-xs text-gray-400 leading-relaxed">
            By submitting your payment information and clicking{' '}
            {payment === 'paypal' ? 'Continue with PayPal' : payment === 'apple' ? 'Continue with Apple Pay' : 'Buy subscription'}{' '}
            you agree to the{' '}
            <a href="#" className="text-blue-500 hover:underline">Terms of Use for Artist Subscriptions</a>
            {' '}and{' '}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-2">
          Signed in as Irinie.{' '}
          <a href="#" className="text-blue-500 hover:underline">Sign out</a>
        </p>
        <div className="flex gap-2 text-sm text-blue-500 flex-wrap">
          {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map((l, i, arr) => (
            <span key={l} className="flex items-center gap-2">
              <a href="#" className="hover:underline">{l}</a>
              {i < arr.length - 1 && <span className="text-gray-300">·</span>}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          Language:
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option>English (US)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}