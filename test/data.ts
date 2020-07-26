import {GridWidgetStore} from "../src/GridWidget"
import { Device } from "../src/GridWidget"

export const testDevice: Device = {
  name: {
    host: "localhost:10000",
    device: "test"
  },
  attributes: [
    {
      name: "double_scalar",
      value: 249.43882402802603,
      history: [{
        time: 0,
        value: 240
      },{
        time: 1,
        value: 241
      },{
        time: 2,
        value: 242
      },{
        time: 3,
        value: 243
      },{
        time: 4,
        value: 244
      },],
    }
  ],
  commands: [
    {
      name: "test_command"
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