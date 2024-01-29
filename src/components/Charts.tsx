'use client'
import React from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Area,
  AreaChart,
} from 'recharts'
import {SingleCharts} from './SingleCharts'
import {DataKeyType} from './CryptoChart'

export type PriceType = {
  date: string
  open: number
  hight: number
  low: number
  close: number
}

export type ChartProps = {
  prices: PriceType[]
  dataKeys?: DataKeyType[]
}

export const Charts = ({prices, dataKeys}: ChartProps) => {
  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={prices}
          syncId="#cryptoChart"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B03A2E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#B03A2E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2874A6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2874A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Legend verticalAlign="top" height={36} />
          <Tooltip />
          <YAxis tickCount={10} type="number" width={80}>
            <Label value="Prices" position="insideLeft" angle={270} />
          </YAxis>
          <XAxis dataKey="date" height={50}>
            <Label value="Date" position="insideBottom" />
          </XAxis>
          <CartesianGrid strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorClose)"
          />
          <Area
            type="monotone"
            dataKey="open"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorOpen)"
          />
          <Area
            type="monotone"
            dataKey="high"
            stroke="#B03A2E"
            fillOpacity={1}
            fill="url(#colorHigh)"
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="#2874A6"
            fillOpacity={1}
            fill="url(#colorLow)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <SingleCharts prices={prices} dataKeys={dataKeys} />
    </>
  )
}
