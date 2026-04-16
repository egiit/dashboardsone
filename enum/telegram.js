import moment from "moment";

export const AUTO_LAMP_CHANNEL = "-1003508446973"
export const DOWNTIME_ALERT_CHANNEL = "-1003586722578"

export const downtimeLampMessage = (mode = false, ip, building, line) => `
Gangguan pada lampu downtime: \n
Current Mode: ${mode ? "ON/Hidup" : "OFF/Mati"}
IP Lamp: ${ip}
Gedung : ${building}
Sewing : ${line}
`

export const downtimeAlertMessage = (listDowntime) => {
    let response = `Detected ${listDowntime.length} downtimes that have not been turned off \n`
    for (let i = 0; i < listDowntime.length; i++) {
        const item = listDowntime[i]
        response += `
${i+1} ---- ${item.SITE_NAME} ${item.LINE_NAME} ----------------
Machine ID : ${item.MACHINE_ID}
Description: ${item.DESCRIPTION} 
Start Date : ${moment(item.START_TIME).format("DD-MMM-YYYY HH:mm")}
Duration : ${getDurationInMinutes(item.START_TIME)} Minute \n
        `
    }

    return response
}

function getDurationInMinutes(startTimeString) {
    if (!startTimeString) return 0;

    const startTime = new Date(startTimeString);
    const currentTime = new Date();

    const diffInMs = currentTime - startTime;
    return Math.floor(diffInMs / 60000);
}
