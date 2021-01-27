import {GridWidgetStore} from "../src"
import { Device } from "../src"

export const testDevice: Device = {
  name: {
    host: "localhost:10000",
    device: "test/devices/1"
  },
  state: "STOPPED",
  attributes: [
    {
      name: "double_scalar",
      value: 249.4388,
      history: [],
    },
    {
      name: "long_scalar",
      value: 245,
      history: [{
        time: 0,
        value: 244
      },{
        time: 1,
        value: 243
      },{
        time: 2,
        value: 242
      },{
        time: 3,
        value: 241
      },{
        time: 4,
        value: 240
      },]
    }
  ],
  commands: [
    {name: "test_command"},
    {name: "start_device"},
    {name: "stop_device"},
    {name: "make_data"}
  ]
}

export const testDevice2: Device = {
  name: {
    host: "localhost:10000",
    device: "test/devices/2"
  },
  state: "STOPPED",
  attributes: [
    {
      name: "value",
      value: Math.sin(3.1415),
      history: [{
        time: 0,
        value: Math.sin(0.5 * 3.1415)
      },{
        time: 1,
        value: Math.sin(3.1415)
      },{
        time: 2,
        value: Math.sin(1.5 * 3.1415)
      },{
        time: 3,
        value: Math.sin(2.0 * 3.1415)
      },{
        time: 4,
        value: Math.sin(2.5 * 3.1415)
      },]
    }
  ],
  commands: [
    {name: "test_command"},
    {name: "start_device"},
    {name: "stop_device"},
    {name: "make_data"}
  ]
}


export const testProps: GridWidgetStore = {
    devices: [
      testDevice, testDevice2
    ],
    config: {
      devices: [
        {
          name: {
            host: "localhost:10000",
            device: "test",
          },
          attributes: [
            {
              name: "double_scalar",
              show: true,
              pollingPeriodS: 5,
              displayPlot: "1"
            }
          ],
          commands: [
            {
              name: "test_command",
              show: true
            }
          ]
        }
      ]
    },
    general: {
      geometry: {
        cols: 2,
        rows: 2
      },
      bgcolor: "#f4f5f9",
      plots: [
        {
          id: "1",
          name: "Test Plot"
        }
      ]
    }
}