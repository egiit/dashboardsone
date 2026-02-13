export const AUTO_LAMP_CHANNEL = "-1003508446973"

export const downtimeLampMessage = (mode = false, ip, building, line) => `
Gangguan pada lampu downtime: \n
Current Mode: ${mode ? "ON/Hidup" : "OFF/Mati"}
IP Lamp: ${ip}
Gedung : ${building}
Sewing : ${line}
`