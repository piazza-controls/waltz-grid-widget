import {GridWidgetStore} from "../src"
import { Device } from "../src"

export const testDevice: Device = {
  name: {
    host: "localhost:10000",
    device: "test"
  },
  state: "STOPPED",
  attributes: [
    {
      name: "double_scalar",
      value: 249.43882402802603,
      history: [],
    },
    {
      name: "scalar",
    }
  ],
  commands: [
    {
      name: "test_command"
    },
    {
      name: "start_device"
    },
    {
      name: "stop_device"
    },
    {
      name: "make_data"
    }
  ]
}

export const testProps: GridWidgetStore = {
    devices: [
      testDevice, 
      {...testDevice, name: {...testDevice.name, device: "test2"}},
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
              show: false,
            },
            {
              name: "scalar",
              show: true,
              pollingPeriodS: 2,
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