import moment from "moment";

export const CheckNilai = (nilai) => {
  if (!nilai || isNaN(nilai)) return 0;

  return nilai;
};

export const totalCol = (dataTable, namecol) => {
  return dataTable.reduce(
    (sum, item) =>
      parseInt(CheckNilai(sum)) + parseInt(CheckNilai(item[namecol])),
    0
  );
};

function calculateTimeDifference(startTime, endTime) {
  // Parse time strings using Moment.js
  // const startTime = moment(time1, "HH:mm:ss");
  // const endTime = moment(time2, "HH:mm:ss");

  // Calculate the difference in minutes
  const duration = moment.duration(endTime.diff(startTime));
  const minutesDiff = duration.asMinutes();

  return minutesDiff;
}

function calcWhByShift(timeRest, start, end, minusRes) {
  if (start.isBefore(timeRest) && end.isAfter(timeRest)) {
    return calculateTimeDifference(start, end) - minusRes;
  } else {
    return calculateTimeDifference(start, end);
  }
}

export const findWh = (shift, schdDate, startH, endH) => {
  const end_rest_normal = moment("12:00:00", "HH:mm:ss");
  const end_rest_a = moment("10:30:00", "HH:mm:ss");
  const end_rest_b = moment("18:30:00", "HH:mm:ss");
  const stratHour = moment(startH, "HH:mm:ss");
  const endHour = moment(endH, "HH:mm:ss");
  //const shiftEndHour = moment(endShift, "HH:mm:ss");
  // const curTime = moment();

  const prodDate = moment(schdDate);
  const dayName = prodDate.format("dddd");

  // if (shiftEndHour.isAfter(curTime) || prodDate.isAfter(curTime)) return planWh;

  const weekeEnd = ["Saturday", "Sunday"];

  //jika Normal shift
  if (shift === "Normal_A") {
    //jika tidak termasuk week
    if (!weekeEnd.includes(dayName)) {
      if (
        stratHour.isBefore(end_rest_normal) &&
        endHour.isAfter(end_rest_normal)
      ) {
        return calculateTimeDifference(stratHour, endHour) - 60;
      }
    } else {
      return calculateTimeDifference(stratHour, endHour);
    }
    return calcWhByShift(end_rest_normal, stratHour, endHour, 60);
  } else if (shift === "Shift_A") {
    if (weekeEnd.includes(dayName)) {
      return calcWhByShift(end_rest_a, stratHour, endHour, 60);
    } else {
      return calcWhByShift(end_rest_a, stratHour, endHour, 30);
    }
  } else {
    if (weekeEnd.includes(dayName)) {
      return calcWhByShift(end_rest_b, stratHour, endHour, 60);
    } else {
      return calcWhByShift(end_rest_b, stratHour, endHour, 30);
    }
  }
};

export const findRTT = (shift, startH, endH, schDate, target, tppm) => {
  const curdate = moment(); //curent date or curent time
  const prodDate = moment("2023-07-12");
  const stratHour = moment(startH, "HH:mm:ss");
  const endHour = moment(endH, "HH:mm:ss");
  const curTarget =
    findWh(shift, schDate, startH, curdate.format('"HH:mm:ss"')) * tppm;

  // if (prodDate.isBefore(curdate)) return target;
  if (prodDate.isAfter(curdate)) return 0;

  if (schDate === curdate.format("YYYY-MM-DD")) {
    if (curdate.isAfter(endHour)) {
      return target;
    } else if (curdate.isBefore(stratHour)) {
      return 0;
    } else if (curTarget > target) {
      return target;
    } else {
      return curTarget;
    }
  } else {
    return target;
  }
};

// const test = findRTT(
//   "Normal_A",
//   "07:00:00",
//   "15:00:00",
//   "2023-07-13",
//   500,
//   1.19
// );
// console.log(test);

export const ChkNilaFlt = (nilai) => {
  const newNilai = parseFloat(nilai);
  if (!newNilai || isNaN(newNilai)) {
    return 0;
  } else {
    return newNilai;
  }
};

//untuk sort
export function CompareBy(a, b, key) {
  if (a[key] < b[key]) {
    return -1;
  }
  if (a[key] > b[key]) {
    return 1;
  }
  return 0;
}

// hitung eff
export function JmlEff(eh, ah) {
  const Eff = (CheckNilai(eh) / CheckNilai(ah)) * 100;
  if (!Number.isFinite(Eff)) return 0;
  return Eff;
}

//sumby colom
export const SumByColoum = (dataTable, namecol) => {
  return dataTable.reduce(
    (sum, item) => CheckNilai(sum) + CheckNilai(item[namecol]),
    0
  );
};
