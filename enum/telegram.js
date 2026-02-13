export const AUTO_LAMP_CHANNEL = "-1003508446973"

export const downtimeLampMessage = (mode = false, ip, building, line) => `
Terdapat gangguan pada lampu downtime: \n
Mode: ${mode ? "ON" : "OFF"}
IP: ${ip}
Building: ${building}
Line: ${line}
`