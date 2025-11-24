import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, BananaEntry, PaymentMethodRecord } from '@/utils/supabaseClient';
import { extractErrorMessage } from '@/lib/utils';
import { exportToExcel } from '@/utils/excelExport';
import PaymentMethodDisplay from '@/components/PaymentMethodDisplay';
import PaymentMethodForm from '@/components/PaymentMethodForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, AlertCircle, Loader2, Calendar, IndianRupee, TrendingUp, Edit2, Trash2, Check, Plus, X } from 'lucide-react';

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [entry, setEntry] = useState<BananaEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethodRecord | null>(null);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('banana_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        setError('Entry not found');
        return;
      }

      setEntry(data as BananaEntry);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to load entry');
      setError(errorMessage);
      console.error('Load entry error:', err, 'Extracted message:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!entry) return;

    try {
      setExporting(true);
      exportToExcel(entry);
    } catch (err: any) {
      setError('Failed to export Excel file');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !id) return;

    setError('');
    setDeleting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('User not authenticated');
        setDeleting(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from('banana_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setSuccess(t('entry_detail.entry_deleted'));
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, 'Failed to delete entry');
      setError(errorMessage);
      console.error('Delete entry error:', err, 'Extracted message:', errorMessage);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-yellow-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-yellow-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-700 p-2 h-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-4">
            <AlertCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-500 flex-shrink-0" />
            <p className="text-sm sm:text-lg text-red-700">{error || 'Entry not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 sm:gap-2 text-gray-700 p-2 h-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Entry Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-8">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Header Info */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div>
                <p className="text-emerald-100 text-xs sm:text-sm mb-1">{t('entry_detail.date')}</p>
                <p className="text-base sm:text-xl font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {new Date(entry.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {entry.dealer_name && (
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm mb-1">{t('entry_detail.vepari')}</p>
                  <p className="text-base sm:text-xl font-semibold">{entry.dealer_name}</p>
                </div>
              )}
              <div>
                <p className="text-emerald-100 text-xs sm:text-sm mb-1">{t('entry_detail.rate_per_20kg')}</p>
                <p className="text-base sm:text-xl font-semibold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 flex-shrink-0" />
                  {(entry.rate_per_20kg || 0)}
                </p>
              </div>
              {entry.payment_due_date && (
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm mb-1">{t('entry_detail.payment_due')}</p>
                  <p className="text-base sm:text-xl font-semibold">
                    {new Date(entry.payment_due_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
              {entry.vehicle_number && (
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm mb-1">{t('entry_detail.vehicle_number')}</p>
                  <p className="text-base sm:text-xl font-semibold">{entry.vehicle_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg flex items-center gap-2 text-sm sm:text-base h-10 sm:h-11"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  {t('entry_detail.exporting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('entry_detail.download_excel')}
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate(`/calculator?edit=${id}`)}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg flex items-center gap-2 text-sm sm:text-base h-10 sm:h-11"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('entry_detail.edit_entry')}
            </Button>

            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg flex items-center gap-2 text-sm sm:text-base h-10 sm:h-11"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('entry_detail.delete_entry')}
            </Button>

            <Button
              onClick={() => setShowPaymentForm(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg flex items-center gap-2 text-sm sm:text-base h-10 sm:h-11"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Payment Method
            </Button>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <Card className="p-4 sm:p-6 border-2 border-red-200 bg-red-50">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-gray-800 font-semibold">
                  {t('entry_detail.confirm_delete')}
                </p>
                <div className="flex gap-2 sm:gap-4 justify-center">
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg h-9 sm:h-10"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('common.delete')}
                      </>
                    ) : (
                      t('common.delete')
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    variant="outline"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg h-9 sm:h-10"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Table Format Display - All Columns in Single Scrollable Container */}
          <Card className="p-3 sm:p-6 overflow-x-auto">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 sticky left-0 z-10">{t('entry_detail.detailed_breakdown')}</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-min">
                {entry.columns.map((column) => (
                  <div key={column.columnNumber} className="flex-shrink-0" style={{ minWidth: '320px' }}>
                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-sm sm:text-lg font-bold text-gray-900">{t('calculator.column_label')} {column.columnNumber}</h4>
                    </div>

                    {/* Table for this column */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-gray-700 border border-gray-300 whitespace-nowrap">{t('calculator.row_label')}</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-gray-700 border border-gray-300 whitespace-nowrap">Weight (kg)</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-left font-semibold text-gray-700 border border-gray-300 whitespace-nowrap">Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {column.rows.map((row, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-900 font-medium border border-gray-300">Row {idx + 1}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-700 border border-gray-300 font-semibold">{row.weight.toFixed(2)}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-700 border border-gray-300 text-xs">{row.remark || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-green-50 border-t-2 border-green-200 font-bold text-green-900">
                            <td colSpan={2} className="px-2 sm:px-3 py-2 sm:py-3 text-right border border-gray-300">Total:</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300">{column.columnTotal.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Total Weight */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm sm:text-lg mb-2">{t('entry_detail.total_weight')}</p>
                <p className="text-3xl sm:text-4xl font-bold text-amber-600">
                  {(entry.grand_total || 0).toFixed(2)} kg
                </p>
              </div>
            </Card>

            {/* Total Earned */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm sm:text-lg mb-2 flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('entry_detail.todays_earnings')}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-green-600">
                  ₹ {(entry.total_earned || 0).toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">
                  {(entry.grand_total || 0).toFixed(2)} kg ÷ 20 × ₹{entry.rate_per_20kg || 0}
                </p>
              </div>
            </Card>
          </div>

          {/* Payment Methods */}
          {id && <PaymentMethodDisplay entryId={id} onEdit={(payment) => setEditingPayment(payment)} />}
        </div>
      </main>

      {/* Payment Method Form Modal */}
      {showPaymentForm && id && entry && (
        <PaymentMethodForm
          entryId={id}
          dealerName={entry.dealer_name}
          totalEarned={entry.total_earned || 0}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={() => {
            setShowPaymentForm(false);
            loadEntry();
          }}
        />
      )}
    </div>
  );
}
