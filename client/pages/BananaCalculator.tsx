import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  supabase,
  calculateTotalEarned,
  BananaEntry,
} from "@/utils/supabaseClient";
import { extractErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sendEmail } from "@/utils/emailClient";

const ROWS_PER_COLUMN = 10;

interface WeightRow {
  weight: number;
  remark: string;
}

interface Column {
  columnNumber: number;
  rows: WeightRow[];
  columnTotal: number;
}

export default function BananaCalculator() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vepariName, setVepariName] = useState("");
  const [location, setLocation] = useState("");
  const [ratePer20kg, setRatePer20kg] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [columns, setColumns] = useState<Column[]>([
    {
      columnNumber: 1,
      rows: Array(ROWS_PER_COLUMN)
        .fill(null)
        .map(() => ({ weight: 0, remark: "" })),
      columnTotal: 0,
    },
  ]);
  const [expandedRemark, setExpandedRemark] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BananaEntry | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (editId) {
      loadEntryForEdit(editId);
    }
  }, [editId]);

  const checkAuth = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate("/login");
        return;
      }
      setUser(user);
    } catch (err) {
      navigate("/login");
    }
  };

  const loadEntryForEdit = async (entryId: string) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      const { data: entry, error: fetchError } = await supabase
        .from("banana_entries")
        .select("*")
        .eq("id", entryId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !entry) {
        setError("Entry not found");
        return;
      }

      const typedEntry = entry as BananaEntry;
      setEditingEntry(typedEntry);
      setIsEditing(true);

      setDate(typedEntry.date);
      setVepariName(typedEntry.dealer_name || "");
      setLocation(typedEntry.location || "");
      setRatePer20kg(typedEntry.rate_per_20kg?.toString() || "");
      setPaymentDueDate(typedEntry.payment_due_date || "");
      setVehicleNumber(typedEntry.vehicle_number || "");
      setColumns(typedEntry.columns);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to load entry for editing",
      );
      setError(errorMessage);
      console.error(
        "Load entry error:",
        err,
        "Extracted message:",
        errorMessage,
      );
    }
  };

  const grandTotal = useMemo(() => {
    return columns.reduce((sum, col) => sum + col.columnTotal, 0);
  }, [columns]);

  const totalEarned = useMemo(() => {
    const rate = parseFloat(ratePer20kg) || 0;
    if (rate === 0) return 0;
    return calculateTotalEarned(grandTotal, rate);
  }, [grandTotal, ratePer20kg]);

  const updateWeight = (colIndex: number, rowIndex: number, weight: string) => {
    const newColumns = [...columns];
    const numWeight = parseFloat(weight) || 0;
    newColumns[colIndex].rows[rowIndex].weight = numWeight;
    updateColumnTotal(newColumns, colIndex);
    setColumns(newColumns);
  };

  const updateRemark = (colIndex: number, rowIndex: number, remark: string) => {
    const newColumns = [...columns];
    newColumns[colIndex].rows[rowIndex].remark = remark;
    setColumns(newColumns);
  };

  const updateColumnTotal = (cols: Column[], colIndex: number) => {
    const total = cols[colIndex].rows.reduce(
      (sum, row) => sum + (row.weight || 0),
      0,
    );
    cols[colIndex].columnTotal = parseFloat(total.toFixed(2));
  };

  const addColumn = () => {
    const newColumnNumber =
      Math.max(...columns.map((c) => c.columnNumber), 0) + 1;
    const newColumn: Column = {
      columnNumber: newColumnNumber,
      rows: Array(ROWS_PER_COLUMN)
        .fill(null)
        .map(() => ({ weight: 0, remark: "" })),
      columnTotal: 0,
    };
    setColumns([...columns, newColumn]);
  };

  const deleteColumn = (colIndex: number) => {
    if (columns.length === 1) return;
    setColumns(columns.filter((_, i) => i !== colIndex));
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setVepariName("");
    setLocation("");
    setRatePer20kg("");
    setPaymentDueDate("");
    setVehicleNumber("");
    setColumns([
      {
        columnNumber: 1,
        rows: Array(ROWS_PER_COLUMN)
          .fill(null)
          .map(() => ({ weight: 0, remark: "" })),
        columnTotal: 0,
      },
    ]);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      // Verify authentication
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error("Authentication error: " + authError.message);
      }

      if (!currentUser && !user) {
        throw new Error("User not authenticated. Please login again.");
      }

      if (grandTotal === 0) {
        setError(t("calculator.please_enter_weight"));
        setSaving(false);
        return;
      }

      if (!ratePer20kg) {
        setError(t("calculator.please_enter_rate"));
        setSaving(false);
        return;
      }

      const rate = parseFloat(ratePer20kg);
      const earned = calculateTotalEarned(grandTotal, rate);

      const entryData = {
        date,
        dealer_name: vepariName || null,
        location: location || null,
        vehicle_number: vehicleNumber || null,
        columns: columns.map((col) => ({
          columnNumber: col.columnNumber,
          rows: col.rows,
          columnTotal: col.columnTotal,
        })),
        grand_total: grandTotal,
        rate_per_20kg: rate,
        payment_due_date: paymentDueDate || null,
        total_earned: earned,
      };

      const userId = currentUser?.id || user?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      if (isEditing && editingEntry) {
        const { error: updateError } = await supabase
          .from("banana_entries")
          .update(entryData)
          .eq("id", editingEntry.id)
          .eq("user_id", userId);

        if (updateError) throw updateError;
        resetForm();
        navigate("/dashboard");
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("banana_entries")
          .insert({
            user_id: userId,
            ...entryData,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Get user profile for email
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("first_name")
          .eq("user_id", userId)
          .maybeSingle();

        const userEmail = currentUser?.email || "";
        const firstName = profile?.first_name || "User";
        const dateStr = new Date(date).toLocaleDateString("en-IN");

        // Send new entry notification email
        await sendEmail("new-entry", userEmail, firstName, {
          date: dateStr,
          weight: grandTotal.toString(),
          earnings: earned.toString(),
          currency: "INR",
        });

        resetForm();
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Failed to save entry");
      console.error("Save error:", err, "Extracted message:", errorMessage);

      // Handle specific Supabase errors with better messaging
      let displayMessage = errorMessage;

      if (
        errorMessage.includes("relation") ||
        errorMessage.includes("table") ||
        errorMessage.includes("does not exist")
      ) {
        displayMessage =
          "The banana_entries table is not set up. Please complete the Supabase setup by running the SQL migrations.";
      } else if (
        errorMessage.includes("permission") ||
        errorMessage.includes("policy") ||
        errorMessage.includes("Policy")
      ) {
        displayMessage =
          "You do not have permission to save entries. Please check the Row Level Security (RLS) policies in Supabase.";
      } else if (
        errorMessage.includes("unique") ||
        errorMessage.includes("duplicate")
      ) {
        displayMessage =
          "A duplicate entry already exists. Please check the data and try again.";
      } else if (errorMessage.includes("constraint")) {
        displayMessage =
          "One or more required fields are invalid. Please check your input and try again.";
      }

      setError(displayMessage);
    } finally {
      setSaving(false);
    }
  };

  const toggleRemark = (key: string) => {
    setExpandedRemark(expandedRemark === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-green-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 sm:gap-2 text-green-700 hover:text-green-900 p-2 h-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-green-900 animate-grow-up">
              {isEditing ? t("entry_detail.edit_entry") : t("calculator.title")}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-grow-up">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Input Section */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("calculator.date")}
                </label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="vepari"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("calculator.vepari_name")}
                </label>
                <Input
                  id="vepari"
                  type="text"
                  placeholder="Enter vepari name"
                  value={vepariName}
                  onChange={(e) => setVepariName(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("calculator.location")}
                </label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="vehicle_number"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("calculator.vehicle_number")}
                </label>
                <Input
                  id="vehicle_number"
                  type="text"
                  placeholder="Enter vehicle number"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="rate"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("calculator.rate_per_20kg")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="rate"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={ratePer20kg}
                  onChange={(e) => setRatePer20kg(e.target.value)}
                  className="w-full text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="paymentDate"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("calculator.payment_due_date")}
                </label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Columns Section */}
          <div className="space-y-4 sm:space-y-6">
            {columns.map((column, colIndex) => (
              <Card key={column.columnNumber} className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {t("calculator.column_label")} {column.columnNumber}
                  </h3>
                  {columns.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteColumn(colIndex)}
                      className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">
                        {t("common.delete")}
                      </span>
                    </Button>
                  )}
                </div>

                {/* Rows */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {column.rows.map((row, rowIndex) => {
                    const remarkKey = `${colIndex}-${rowIndex}`;
                    const isExpanded = expandedRemark === remarkKey;

                    return (
                      <div key={rowIndex} className="space-y-2">
                        {/* Weight Input */}
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="min-w-12 sm:min-w-16">
                            <p className="text-xs font-medium text-gray-600">
                              {t("calculator.row_label")} {rowIndex + 1}
                            </p>
                          </div>
                          <div className="flex-1">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder={t("calculator.weight_placeholder")}
                              value={row.weight || ""}
                              onChange={(e) =>
                                updateWeight(colIndex, rowIndex, e.target.value)
                              }
                              className="w-full text-sm h-8 sm:h-9"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRemark(remarkKey)}
                            className="p-1.5 sm:p-2 h-8 sm:h-9"
                            title={t("calculator.add_remark")}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </Button>
                        </div>

                        {/* Remark Input - Show on Toggle */}
                        {isExpanded && (
                          <div className="pl-2 sm:pl-3 pr-2 sm:pr-3 pb-2 sm:pb-3">
                            <Input
                              type="text"
                              placeholder={t("calculator.remark_placeholder")}
                              value={row.remark}
                              onChange={(e) =>
                                updateRemark(colIndex, rowIndex, e.target.value)
                              }
                              className="w-full text-sm h-9 sm:h-10"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column Total */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4 text-right">
                  <p className="text-gray-600 text-xs sm:text-sm mb-1">
                    {t("calculator.column_total")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {column.columnTotal.toFixed(2)} kg
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Add Column Button */}
          <div className="flex justify-center">
            <Button
              onClick={addColumn}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center gap-2 text-sm sm:text-base h-10 sm:h-11 transition-all hover:shadow-lg"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("calculator.add_column")}
            </Button>
          </div>

          {/* Grand Total and Earnings */}
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 animate-float-gentle">
            <div className="space-y-6">
              <div className="text-center pb-4 sm:pb-6 border-b border-orange-200">
                <p className="text-gray-600 text-base sm:text-lg mb-2">
                  {t("calculator.grand_total_weight")}
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-orange-600">
                  {grandTotal.toFixed(2)} kg
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-base sm:text-lg mb-2">
                  {t("calculator.todays_earnings")}
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-orange-600 animate-growth-pulse">
                  {ratePer20kg ? `₹ ${totalEarned.toFixed(2)}` : "₹ 0.00"}
                </p>
                {ratePer20kg && (
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
                    ({grandTotal.toFixed(2)} kg ÷ 20 × ₹
                    {parseFloat(ratePer20kg).toLocaleString()})
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-4 justify-center flex-col sm:flex-row">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 sm:px-8 rounded-lg flex items-center justify-center gap-2 flex-1 sm:flex-none h-12 sm:h-11 text-base sm:text-base shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("calculator.saving")}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? t("common.update") : t("calculator.save_entry")}
                </>
              )}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="font-bold py-3 px-6 sm:px-8 rounded-lg flex items-center justify-center gap-2 flex-1 sm:flex-none h-12 sm:h-11 text-base sm:text-base"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">{t("common.reset")}</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
