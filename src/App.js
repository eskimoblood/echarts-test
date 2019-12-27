import React, { useState, useRef } from 'react'
import { without, isEmpty, range, last, uniq, get } from 'lodash'
import ReactEcharts from 'echarts-for-react'
import './App.css'

const getOption = selectedRow => ({
    animation: false,
    xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
        type: 'value',
    },
    series: [
        {
            data: [120, 200, 150, 80, 70, 110, 130].map((value, i) =>
                selectedRow.includes(i)
                    ? { value, itemStyle: { color: 'green' } }
                    : value
            ),
            type: 'bar',
        },
    ],
    graphic: {
        elements: [
            {
                type: 'rect',
                shape: { width: 800, height: 300 },
                style: {
                    fill: 'white',
                },
            },
        ],
    },
})

const onEvents = ({
    update,
    selectedRow,
    setStartOffsetX,
    startOffsetX,
    echarts,
}) => ({
    mousedown: ({ event: { offsetX } }) => setStartOffsetX(offsetX),
    mouseup: ({ dataIndex, componentSubType, event, ...rest }) => {
        setStartOffsetX(null)
        if (componentSubType !== 'bar') {
            update([])
        }
        if (getValue(echarts, startOffsetX) === dataIndex) {
            update(
                selectedRow.includes(dataIndex)
                    ? without(selectedRow, dataIndex)
                    : event.event.shiftKey
                    ? isEmpty(selectedRow)
                        ? range(0, dataIndex + 1)
                        : uniq(
                              selectedRow.concat(
                                  range(last(selectedRow), dataIndex + 1)
                              )
                          )
                    : selectedRow.concat(dataIndex)
            )
        }
    },
    mousemove: ({
        event: {
            offsetX,
            event: { buttons },
        },
    }) => {
        if (buttons === 1) {
            const start = getValue(echarts, startOffsetX)
            const end = getValue(echarts, offsetX)
            update(range(start, end + (start > end ? -1 : 1)))
        }
    },
})
const getValue = (echarts, offsetX) => {
    const instance = echarts.current.getEchartsInstance()
    return instance.convertFromPixel({ seriesIndex: 0 }, [offsetX, 0])[0]
}

function App() {
    const [selectedRow, update] = useState([])
    const [startOffsetX, setStartOffsetX] = useState()
    const echarts = useRef(null)
    const options = getOption(selectedRow, setStartOffsetX)

    return (
        <div>
            <ReactEcharts
                ref={echarts}
                option={options}
                style={{ height: '300px' }}
                onEvents={onEvents({
                    update,
                    selectedRow,
                    setStartOffsetX,
                    startOffsetX,
                    echarts,
                })}
            />
            <dl>
                <dt>Selected</dt>
                <dd>
                    {options.xAxis.data
                        .filter((_, i) => selectedRow.includes(i))
                        .join(',')}
                </dd>
            </dl>
        </div>
    )
}

export default App
