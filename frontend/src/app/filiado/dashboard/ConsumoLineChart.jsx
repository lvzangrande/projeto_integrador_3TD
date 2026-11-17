"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function ConsumoLineChart({ serie, formatarDiaMes, formatarInteiro }) {
  const data = useMemo(() => ({
    labels: serie.map((p) => formatarDiaMes(p.data)),
    datasets: [{
      data: serie.map((p) => Number(p.clientes) || 0),
      borderColor: "#14b8ee",
      backgroundColor: (context) => {
        const { chart } = context;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(20,184,238,.12)";
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(79,214,255,.25)");
        gradient.addColorStop(1, "rgba(20,184,238,0)");
        return gradient;
      },
      borderWidth: 3,
      pointRadius: serie.length < 14 ? 3 : 0,
      pointHoverRadius: 5,
      pointBackgroundColor: "#4fd6ff",
      pointBorderColor: "#05213b",
      pointBorderWidth: 2,
      fill: true,
      tension: 0.32,
    }],
  }), [serie, formatarDiaMes]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#06233f",
        borderColor: "rgba(80,160,220,.35)",
        borderWidth: 1,
        titleColor: "#e8f3fc",
        bodyColor: "#cfe6f7",
        displayColors: false,
        callbacks: { label: (item) => `${formatarInteiro(item.parsed.y)} ${item.parsed.y === 1 ? "cliente cadastrado" : "clientes cadastrados"}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#7fb2d6", maxTicksLimit: 5, maxRotation: 0, autoSkip: true, font: { family: 'Inter, "Segoe UI", system-ui, sans-serif', size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(155,182,203,.18)" },
        border: { display: false, dash: [4, 4] },
        ticks: { color: "#7fb2d6", maxTicksLimit: 5, padding: 8, precision: 0, callback: (value) => formatarInteiro(value), font: { family: 'Inter, "Segoe UI", system-ui, sans-serif', size: 11 } },
      },
    },
  }), [formatarInteiro]);

  return <div className="aff-chart__canvas"><Line data={data} options={options} aria-label="Gráfico de linha de novos clientes cadastrados por dia" role="img" /></div>;
}
