// Web Bluetooth API type definitions
interface Bluetooth extends EventTarget {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface RequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[];
  optionalServices?: BluetoothServiceUUID[];
}

interface BluetoothRequestDeviceFilter {
  name?: string;
  namePrefix?: string;
  services?: BluetoothServiceUUID[];
}

interface BluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: 'gattserverdisconnected', listener: (this: this, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
}

interface BluetoothRemoteGATTServer {
  readonly connected: boolean;
  readonly device: BluetoothDevice;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
}

type BluetoothServiceUUID = number | string;

interface Navigator {
  bluetooth?: Bluetooth;
}

declare global {
  interface Navigator {
    bluetooth?: Bluetooth;
  }
}