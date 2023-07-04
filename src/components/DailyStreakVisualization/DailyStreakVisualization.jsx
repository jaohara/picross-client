import React from 'react';

import "./DailyStreakVisualization.scss";

const DailyStreakVisualization = () => {
  // TODO: only necessary for demo stuff?
  const dailyStreakCellNames = [
    "daily-streak-cell-00",
    "daily-streak-cell-10",
    "daily-streak-cell-20",
    "daily-streak-cell-30",
    "daily-streak-cell-40",
    "daily-streak-cell-50",
    "daily-streak-cell-60",
    "daily-streak-cell-70",
    "daily-streak-cell-80",
    "daily-streak-cell-90",
    "daily-streak-cell-100",
  ];

  const getRandomClassName = () => 
    dailyStreakCellNames[Math.floor(Math.random() * dailyStreakCellNames.length)];

  // TODO: Maybe move to its own module in utils?
  const getPastDates = (
    // 84 is past 12 weeks
    // initialDayDelta = 84,
    // 77 is 11 weeks, which we'll use plus currentDate.getDay for the week in progress 
    initialDayDelta = 77
  ) => {
    const currentDate = new Date();
    console.log("DailyStreakVisualization: getPastDates: currentDate is:", currentDate);
    console.log("DailyStreakVisualization: getPastDates: currentDate.getDay():", currentDate.getDay());
    const pastDates = [];

    // get actual day delta
    const dayDelta = initialDayDelta + currentDate.getDay();

    // this solution is a little ugly
    let currentWeekday = 0;
    let currentWeek = 0;

    for (let i = dayDelta; i >= 0; i--) {
      if (currentWeekday === 7) {
        // we've overshot the current week, roll into the next one
        currentWeekday = 0;
        currentWeek++;
      }

      if (currentWeekday === 0) {
        pastDates.push([]);
      }

      const millisOffset = i * 24 * 60 * 60 * 1000;
      const date = new Date(currentDate.getTime() - millisOffset);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      //TODO: If we want to show dates as day/month (global style), we'd do it here
      pastDates[currentWeek].push(`${month}/${day}`);

      currentWeekday++;
    }


    console.log("DailyStreakVisualization: getPastDates: result is:", pastDates);
    return pastDates;
  }

  const cellWeeks = getPastDates();

  

  return (
    <div className="daily-streak-container">
      {/* <div className="daily-streak-cell-00">7/3</div>
      <div className="daily-streak-cell-10">7/4</div>
      <div className="daily-streak-cell-20">7/5</div>
      <div className="daily-streak-cell-30">7/6</div>
      <div className="daily-streak-cell-40">7/7</div>
      <div className="daily-streak-cell-50">7/8</div>
      <div className="daily-streak-cell-60">7/9</div>
      <div className="daily-streak-cell-70">7/10</div>
      <div className="daily-streak-cell-80">7/11</div>
      <div className="daily-streak-cell-90">7/12</div>
      <div className="daily-streak-cell-100">7/13</div> */}

      {/* Temp daily streak vis */}
      {/* {
        cellDates.map((cellDate, index) => (
          <div className={getRandomClassName()} index={index}>{cellDate}</div> 
        ))
      } */}
      
      {
        cellWeeks.map((week, index) => (
          <div 
            className="daily-streak-week"
            key={index}
          >
            {
              week.map((cellDate, index) => (
                <div className={getRandomClassName()} key={index}>{cellDate}</div> 
              ))
            }
          </div>
        ))
      }

      
    </div>
  );
}
 
export default DailyStreakVisualization;