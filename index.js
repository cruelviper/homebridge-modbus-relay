const ModbusRTU = require("modbus-serial");
let Service, Characteristic;

module.exports = (homebridge) => {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-modbus-relay", "ModbusRelay", ModbusRelayAccessory);
};

class ModbusRelayAccessory {
    constructor(log, config) {
        this.log = log;
        this.name = config.name || "Modbus Relay";
        this.ip = config.ip || "192.168.0.200";
        this.port = config.port || 4196;
        this.relay = config.relay || 0; // Relay-Adresse 0-7
        this.mode = config.mode || "switch"; // "switch" oder "auto-off"
        this.autoOffDelay = config.autoOffDelay || 0; // Auto-Off-Zeit in Millisekunden
        this.isConnected = false; // Status der Verbindung

        this.client = new ModbusRTU();

        // Verbindung initialisieren
        this.connectToModbus();

        this.service = new Service.Switch(this.name);
        this.service
            .getCharacteristic(Characteristic.On)
            .on("get", this.getRelayStatus.bind(this))
            .on("set", this.setRelayStatus.bind(this));
    }

async connectToModbus() {
    try {
        // Schließe die bestehende Verbindung, falls sie offen ist
        if (this.client.isOpen) {
            this.log.info("Closing existing Modbus connection...");
            await this.client.close();
        }

        // Stelle eine neue Verbindung her
        await this.client.connectTCP(this.ip, { port: this.port });
        this.client.setTimeout(5000); // Timeout für Modbus-Operationen (z. B. 2 Sekunden)
        this.isConnected = true;
        this.log.info(`Connected to Modbus device at ${this.ip}:${this.port}`);
    } catch (err) {
        this.isConnected = false;
        this.log.error(`Error connecting to Modbus device at ${this.ip}:${this.port}:`, err);

        // Wiederholungsversuch nach 5 Sekunden
        setTimeout(() => this.connectToModbus(), 5000);
    }
}

    async getRelayStatus(callback) {

        try {
            if (!this.isConnected) {
                await this.connectToModbus(); // Verbindung wiederherstellen
            }
            if (!this.isConnected) {
                // Verbindung konnte nicht hergestellt werden
                this.log.warn(`Relay ${this.relay}: Unable to connect to Modbus device. Setting status to OFF.`);
                this.service.updateCharacteristic(Characteristic.On, false); // Status in Apple Home auf OFF setzen
                return callback(null, false); // Rückmeldung an Homebridge
            }
            const data = await this.client.readCoils(this.relay, 1); // Status abfragen
            const isOn = data.data[0] === true;
            this.log.info(`Relay ${this.relay} status: ${isOn ? "ON" : "OFF"}`);
            callback(null, isOn);
        } catch (err) {
            this.log.error(`Error reading relay status for relay ${this.relay}:`, err);
            this.service.updateCharacteristic(Characteristic.On, false); // Status in Apple Home auf OFF setzen
            callback(null, false); // Rückmeldung an Homebridge
        }
    }

	async setRelayStatus(state, callback) {
    try {
        if (!this.client.isOpen) {
            this.log.warn(`Relay ${this.relay}: Connection not open. Attempting to reconnect.`);
            await this.connectToModbus(); // Verbindung wiederherstellen
        }

        if (!this.client.isOpen) {
            this.log.error(`Relay ${this.relay}: Unable to reconnect to Modbus device.`);
            return callback(new Error("Unable to connect to Modbus device"));
        }

        const command = state ? 0xFF00 : 0x0000;
        await this.client.writeCoil(this.relay, command);
        this.log.info(`Relay ${this.relay} set to ${state ? "ON" : "OFF"}.`);

        // Automatisches Ausschalten
        if (state && this.mode === "auto-off" && this.autoOffDelay > 0) {
            setTimeout(async () => {
                try {
                    if (!this.client.isOpen) {
                        await this.connectToModbus(); // Verbindung wiederherstellen
                    }
                    await this.client.writeCoil(this.relay, 0x0000);
                    this.log.info(`Relay ${this.relay} automatically turned OFF after ${this.autoOffDelay}ms.`);
                    this.service.updateCharacteristic(Characteristic.On, false); // Status aktualisieren
                } catch (err) {
                    this.log.error(`Error turning off relay ${this.relay}:`, err);
                }
            }, this.autoOffDelay);
        }

        callback(null);
    } catch (err) {
        this.log.error(`Error setting relay status for relay ${this.relay}:`, err);
        callback(err);
    }
}

    getServices() {
        return [this.service];
    }
}
