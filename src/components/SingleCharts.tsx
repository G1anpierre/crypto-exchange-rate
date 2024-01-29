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
import {DataKeyType, PriceType} from './Charts'

type SingleChartsProps = {
  prices: PriceType[]
  dataKeys: DataKeyType[]
}

export const SingleCharts = ({prices, dataKeys}: SingleChartsProps) => {
  return (
    <>
      {dataKeys.map(dataKey => (
        <ResponsiveContainer width="100%" height={200} key={dataKey.type}>
          <AreaChart
            data={prices}
            syncId="#cryptoChart"
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" height={50}>
              <Label value="Date" position="insideBottom" />
            </XAxis>
            <YAxis type="number" width={80} tickCount={10}>
              <Label value="Prices" position="insideLeft" angle={270} />
            </YAxis>
            <Legend verticalAlign="top" height={36} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={dataKey.type}
              stroke={dataKey.color}
              fill={dataKey.color}
            />
          </AreaChart>
        </ResponsiveContainer>
      ))}
    </>
  )
}
