import {GridWidgetStore} from "../src/GridWidget"
import { Device } from "../src/GridWidget"

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
      // {...testDevice, device: "test2"}, 
      // {...testDevice, device: "test3"}
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