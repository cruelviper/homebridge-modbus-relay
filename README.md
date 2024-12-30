# homebridge-modbus-relay
Control Waveshare Modbus Relay Network Card trough Homebridge

# homebridge-modbus-relay
[![npm](https://img.shields.io/npm/v/homebridge-modbus-relay.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-modbus-relay)
[![npm](https://img.shields.io/npm/dt/homebridge-modbus-relay.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-modbus-relay)
[![GitHub last commit](https://img.shields.io/github/last-commit/cruelviper/homebridge-modbus-relay.svg?style=flat-square)](https://github.com/cruelviper/homebridge-modbus-relay)

This is a waveshare modbus relais card plugin for [homebridge](https://github.com/nfarina/homebridge) that features setting every relais on or off or an auto toggle/switch-off after setable time (for garage opener or stairs light. You can download it via [npm](https://www.npmjs.com/package/homebridge-modbus-relay).  

Feel free to leave any feedback [here](https://github.com/cruelviper/homebridge-modbus-relay/issues).

## Features
- see status of every configured relais
- sert every relay status on or off
- reconnects websocket connections

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebrigde-modbus-relay` *Note: The installation might take 1 minute.*
3. Configure via the plugin `homebridge-config-ui-x` or update your configuration file manually. See the explanation and sample below.

## Configuration

Below are example configuration for 2 relais.

### Example

```json
"accessories": [
        {
            "accessory": "ModbusRelay",
            "name": "Relay 1",
            "ip": "192.168.0.200",
            "port": 4196,
            "relay": 0,
            "mode": "switch"
        },
        {
            "accessory": "ModbusRelay",
            "name": "Relay 2 Garage Opener",
            "ip": "192.168.0.200",
            "port": 4196,
            "relay": 1,
            "mode": "auto-off",
            "autoOffDelay": 1000
        }
]
```

## Example Use Cases

- Switch on a light or other devices connected to te relay.
- trigger a garage door or a stair light with a toggle.
