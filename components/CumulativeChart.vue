<script setup lang="ts">
import { Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
} from "chart.js"

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

defineProps<{
  labels: string[]
  datasets: Array<{ 
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    tension?: number
  }>
}>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Cumulative Burger Count Over Time',
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        title: function(context: any) {
          const date = new Date(context[0].label)
          return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          })
        },
        label: function(context: any) {
          return `${context.dataset.label}: ${context.parsed.y} 🍔`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date'
      },
      ticks: {
        maxTicksLimit: 10,
        callback: function(value: any, index: number, values: any[]) {
          const date = new Date(this.getLabelForValue(value))
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Cumulative Burger Count 🍔'
      },
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  },
  elements: {
    point: {
      radius: 2,
      hoverRadius: 6
    },
    line: {
      borderWidth: 2
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="h-96">
      <Line 
        :data="{ labels, datasets }" 
        :options="chartOptions"
      />
    </div>
    
    <div class="mt-6 text-center text-sm text-gray-600">
      <p>This chart shows the cumulative number of burgers eaten by each participant over the challenge period.</p>
    </div>
  </div>
</template>