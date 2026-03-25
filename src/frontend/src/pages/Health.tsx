import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Flame,
  Footprints,
  Heart,
  Scale,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { HealthMetric } from "../backend.d";
import {
  useHealthMetricsHistory,
  useLogHealthMetric,
} from "../hooks/useQueries";

export default function HealthPage() {
  const { data: metrics, isLoading } = useHealthMetricsHistory();
  const logMetric = useLogHealthMetric();

  const [form, setForm] = useState({
    heartRate: "",
    steps: "",
    calories: "",
    weight: "",
    systolic: "",
    diastolic: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const metric: HealthMetric = {
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      heartRateBpm: form.heartRate ? BigInt(form.heartRate) : undefined,
      stepsCount: form.steps ? BigInt(form.steps) : undefined,
      caloriesBurned: form.calories ? BigInt(form.calories) : undefined,
      bodyWeightLbs: form.weight ? Number.parseFloat(form.weight) : undefined,
      bloodPressureSystolic: form.systolic ? BigInt(form.systolic) : undefined,
      bloodPressureDiastolic: form.diastolic
        ? BigInt(form.diastolic)
        : undefined,
    };
    try {
      await logMetric.mutateAsync(metric);
      toast.success("Health metrics saved!");
      setForm({
        heartRate: "",
        steps: "",
        calories: "",
        weight: "",
        systolic: "",
        diastolic: "",
      });
    } catch {
      toast.error("Failed to save metrics");
    }
  };

  const sorted = [...(metrics || [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  const chartData = sorted
    .slice(0, 14)
    .reverse()
    .map((m) => ({
      date: new Date(Number(m.timestamp) / 1_000_000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      ),
      heartRate: m.heartRateBpm ? Number(m.heartRateBpm) : undefined,
      steps: m.stepsCount ? Number(m.stepsCount) : undefined,
      calories: m.caloriesBurned ? Number(m.caloriesBurned) : undefined,
      weight: m.bodyWeightLbs || undefined,
    }));

  const latest = sorted[0];

  return (
    <div data-ocid="health.page">
      {/* Blue metrics band */}
      <div
        className="px-6 py-6"
        style={{
          background: "linear-gradient(135deg, #1E73E8 0%, #3b8ef0 100%)",
        }}
      >
        <h1 className="text-xl font-bold text-white mb-4">My Health Metrics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Heart Rate",
              value: latest?.heartRateBpm ? `${latest.heartRateBpm} bpm` : "—",
              icon: Heart,
              color: "bg-red-500/20 text-red-200",
            },
            {
              label: "Steps",
              value: latest?.stepsCount
                ? Number(latest.stepsCount).toLocaleString()
                : "—",
              icon: Footprints,
              color: "bg-green-500/20 text-green-200",
            },
            {
              label: "Calories",
              value: latest?.caloriesBurned
                ? `${latest.caloriesBurned} kcal`
                : "—",
              icon: Flame,
              color: "bg-orange-500/20 text-orange-200",
            },
            {
              label: "Weight",
              value: latest?.bodyWeightLbs
                ? `${latest.bodyWeightLbs} lbs`
                : "—",
              icon: Scale,
              color: "bg-purple-500/20 text-purple-200",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white/15 backdrop-blur rounded-xl p-4"
              data-ocid={`health.${label.toLowerCase()}.card`}
            >
              <div
                className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-white/70 text-xs">{label}</p>
              <p className="text-white font-bold text-lg">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 grid lg:grid-cols-2 gap-6">
        {/* Log form */}
        <Card className="shadow-card" data-ocid="health.log_form.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Log Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-ocid="health.metrics.form"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={form.heartRate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, heartRate: e.target.value }))
                    }
                    className="mt-1"
                    data-ocid="health.heart_rate.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Steps Count</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={form.steps}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, steps: e.target.value }))
                    }
                    className="mt-1"
                    data-ocid="health.steps.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Calories Burned</Label>
                  <Input
                    type="number"
                    placeholder="450"
                    value={form.calories}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, calories: e.target.value }))
                    }
                    className="mt-1"
                    data-ocid="health.calories.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Body Weight (lbs)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="185"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, weight: e.target.value }))
                    }
                    className="mt-1"
                    data-ocid="health.weight.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Blood Pressure Systolic</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={form.systolic}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, systolic: e.target.value }))
                    }
                    className="mt-1"
                    data-ocid="health.systolic.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Blood Pressure Diastolic</Label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={form.diastolic}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, diastolic: e.target.value }))
                    }
                    className="mt-1"
                    data-ocid="health.diastolic.input"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={logMetric.isPending}
                className="w-full"
                data-ocid="health.log_metrics.submit_button"
              >
                {logMetric.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Metrics"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-card" data-ocid="health.chart.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Heart Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton
                className="h-48 rounded-lg"
                data-ocid="health.chart.loading_state"
              />
            ) : chartData.some((d) => d.heartRate) ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="oklch(0.54 0.18 252)"
                    strokeWidth={2}
                    dot={false}
                    name="Heart Rate (bpm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-48 flex items-center justify-center text-muted-foreground"
                data-ocid="health.chart.empty_state"
              >
                <div className="text-center">
                  <Heart className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm">Log metrics to see your trend</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History list */}
        <div className="lg:col-span-2" data-ocid="health.history.card">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">
                Metrics History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="health.history.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="health.history.empty_state"
                >
                  <Activity className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm">No health metrics logged yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sorted.slice(0, 10).map((m, i) => (
                    <motion.div
                      key={String(m.timestamp) + String(i)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex flex-wrap gap-3 items-center p-3 rounded-lg bg-muted/40"
                      data-ocid={`health.history.item.${i + 1}`}
                    >
                      <span className="text-xs text-muted-foreground min-w-[80px]">
                        {new Date(
                          Number(m.timestamp) / 1_000_000,
                        ).toLocaleDateString()}
                      </span>
                      {m.heartRateBpm && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          ❤️ {m.heartRateBpm.toString()} bpm
                        </span>
                      )}
                      {m.stepsCount && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          👣 {Number(m.stepsCount).toLocaleString()} steps
                        </span>
                      )}
                      {m.caloriesBurned && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          🔥 {m.caloriesBurned.toString()} kcal
                        </span>
                      )}
                      {m.bodyWeightLbs && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          ⚖️ {m.bodyWeightLbs} lbs
                        </span>
                      )}
                      {m.bloodPressureSystolic && m.bloodPressureDiastolic && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          🩺 {m.bloodPressureSystolic.toString()}/
                          {m.bloodPressureDiastolic.toString()}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
