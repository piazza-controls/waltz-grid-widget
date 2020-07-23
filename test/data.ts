import {GridWidgetProps} from "../src/GridWidget"
import { Device } from "../src/Tango"

export const testDevice: Device = {
  host: "localhost:10000",
  device: "test",
  attributes: [
    {
      name: "double_scalar",
      value: 249.43882402802603
    }
  ],
  commands: []
}

export const testProps: GridWidgetProps = {
    devices: [
      testDevice, testDevice, testDevice
    ],
    geometry: {
        cols: 2,
        rows: 2
    }
}