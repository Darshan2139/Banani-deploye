import { useState } from 'react';
import { supabase, PaymentMethod } from '@/utils/supabaseClient';
import { extractErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, AlertCircle, CheckCircle, Loader2, CreditCard, Smartphone, FileText } from 'lucide-react';

interface PaymentMethodFormProps {
  entryId: string;
  dealerName?: string;
  totalEarned: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentMethodForm({
  entryId,
  dealerName,
  totalEarned,
  onClose,
  onSuccess,
}: PaymentMethodFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [transactionId, setTransactionId] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeIssuerName, setChequeIssuerName] = useState(dealerName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateInput = () => {
    if (paymentMethod === 'google_pay' && !transactionId.trim()) {
      setError('Please enter Google Pay transaction ID');
      return false;
    }
    if (paymentMethod === 'bank_transfer' && !bankNumber.trim()) {
      setError('Please enter bank account number');
      return false;
    }
    if (paymentMethod === 'cheque') {
      if (!chequeNumber.trim()) {
        setError('Please enter cheque number');
        return false;
      }
      if (!chequeIssuerName.trim()) {
        setError('Please enter vepari/cheque issuer name');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateInput()) {
      return;
    }

    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('User not authenticated');
        return;
      }

      const paymentData: any = {
        entry_id: entryId,
        user_id: user.id,
        payment_method: paymentMethod,
        payment_received_date: new Date().toISOString(),
      };

      if (paymentMethod === 'google_pay') {
        paymentData.transaction_id = transactionId;
      } else if (paymentMethod === 'bank_transfer') {
        paymentData.bank_number = bankNumber;
      } else if (paymentMethod === 'cheque') {
        paymentData.cheque_number = chequeNumber;
        paymentData.cheque_issuer_name = chequeIssuerName;
      }

      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert([paymentData]);

      if (insertError) {
        // Check if table doesn't exist
        if (insertError.code === '42P01' || insertError.message?.includes('does not exist')) {
          setError('Payment methods table not set up. Please run the SQL migration in Supabase.');
        } else {
          throw insertError;
        }
        return;
      }

      setSuccess('Payment method saved successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to save payment method');
      console.error('Payment method save error:', err, 'Extracted message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl shadow-2xl border-0 max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Payment Method</h2>
            <p className="text-gray-600 text-sm mt-1">Amount: ₹ {totalEarned.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('google_pay');
                    setError('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'google_pay'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-900">Google Pay</span>
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('bank_transfer');
                    setError('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">Bank Transfer</span>
                </button>

                {/* Cheque */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('cheque');
                    setError('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'cheque'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <FileText className="w-6 h-6 text-amber-600" />
                  <span className="text-sm font-semibold text-gray-900">Cheque</span>
                </button>
              </div>
            </div>

            {/* Google Pay Form */}
            {paymentMethod === 'google_pay' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label htmlFor="transactionId" className="block text-sm font-semibold text-gray-900 mb-2">
                  Google Pay Transaction ID
                </label>
                <Input
                  id="transactionId"
                  type="text"
                  placeholder="Enter transaction ID (e.g., GPay123456789)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="text-sm h-11"
                  required
                />
                <p className="text-xs text-gray-600 mt-2">
                  You can find this in your Google Pay transaction history
                </p>
              </div>
            )}

            {/* Bank Transfer Form */}
            {paymentMethod === 'bank_transfer' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label htmlFor="bankNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                  Bank Account Number
                </label>
                <Input
                  id="bankNumber"
                  type="text"
                  placeholder="Enter bank account number"
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  className="text-sm h-11"
                  required
                />
                <p className="text-xs text-gray-600 mt-2">
                  Keep this for your records. You can also include IFSC/SWIFT codes if needed
                </p>
              </div>
            )}

            {/* Cheque Form */}
            {paymentMethod === 'cheque' && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-4">
                <div>
                  <label htmlFor="chequeNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                    Cheque Number
                  </label>
                  <Input
                    id="chequeNumber"
                    type="text"
                    placeholder="Enter cheque number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="text-sm h-11"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="chequeIssuerName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Vepari / Cheque Issuer Name
                  </label>
                  <Input
                    id="chequeIssuerName"
                    type="text"
                    placeholder="Enter vepari or cheque issuer name"
                    value={chequeIssuerName}
                    onChange={(e) => setChequeIssuerName(e.target.value)}
                    className="text-sm h-11"
                    required
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Save the physical cheque safely and keep records for clearing
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Payment Method'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
