import { useEffect, useState } from 'react';
import { supabase, PaymentMethodRecord } from '@/utils/supabaseClient';
import { extractErrorMessage } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CreditCard, Smartphone, FileText, CheckCircle, Trash2, Edit2 } from 'lucide-react';

interface PaymentMethodDisplayProps {
  entryId: string;
  onEdit?: (payment: PaymentMethodRecord) => void;
}

export default function PaymentMethodDisplay({ entryId, onEdit }: PaymentMethodDisplayProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, [entryId]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('entry_id', entryId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Silently ignore if table doesn't exist or user doesn't have access
        console.debug('Payment methods not available:', fetchError?.message);
        setPaymentMethods([]);
        setError('');
        return;
      }

      setPaymentMethods(data || []);
      setError('');
    } catch (err: any) {
      console.debug('Failed to load payment methods:', err?.message);
      setPaymentMethods([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    setDeleting(paymentId);
    setDeleteError('');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setDeleteError('Not authenticated');
        return;
      }

      const { error: deleteError } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setPaymentMethods(paymentMethods.filter(p => p.id !== paymentId));
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to delete payment method');
      setDeleteError(errorMessage);
      console.error('Delete payment error:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <p className="text-gray-600 text-sm">Loading payment methods...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </Card>
    );
  }

  if (deleteError) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      </Card>
    );
  }

  if (paymentMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-600" />
        Payment Method(s)
      </h3>

      {paymentMethods.map((payment) => (
        <Card key={payment.id} className="p-6 bg-gradient-to-br border-l-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Payment Method Badge */}
              <div className="flex items-center gap-3 mb-4">
                {payment.payment_method === 'google_pay' && (
                  <>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Google Pay</p>
                      <p className="text-xs text-gray-500">Digital Payment</p>
                    </div>
                  </>
                )}
                {payment.payment_method === 'bank_transfer' && (
                  <>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Bank Transfer</p>
                      <p className="text-xs text-gray-500">Direct Bank</p>
                    </div>
                  </>
                )}
                {payment.payment_method === 'cheque' && (
                  <>
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Cheque</p>
                      <p className="text-xs text-gray-500">Cheque Payment</p>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                {payment.payment_method === 'google_pay' && payment.transaction_id && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{payment.transaction_id}</p>
                  </div>
                )}

                {payment.payment_method === 'bank_transfer' && payment.bank_number && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Bank Account Number</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{payment.bank_number}</p>
                  </div>
                )}

                {payment.payment_method === 'cheque' && (
                  <>
                    {payment.cheque_number && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Cheque Number</p>
                        <p className="text-sm font-mono text-gray-900">{payment.cheque_number}</p>
                      </div>
                    )}
                    {payment.cheque_issuer_name && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Vepari / Issuer Name</p>
                        <p className="text-sm text-gray-900">{payment.cheque_issuer_name}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Payment Date */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-500">
                    Recorded on {new Date(payment.payment_received_date).toLocaleDateString('en-IN')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => onEdit?.(payment)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm"
                    disabled={deleting === payment.id}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(payment.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm"
                    disabled={deleting === payment.id}
                  >
                    {deleting === payment.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
