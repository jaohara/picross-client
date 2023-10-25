import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import "./DailyStreakVisualization.scss";

import { WEEKDAY_STRINGS } from '../../constants';

// import convertFromFirestoreTimestampToDate from '../../utils/convertFromFirestoreTimeStampToDate';
import findKeyWithLargestArray from '../../utils/findKeyWithLargestArray';

// removing this space, not sure what the week number header adds to the table
// const weekdays = [" ", ...WEEKDAY_STRINGS];
const weekdays = [...WEEKDAY_STRINGS];

/*
  To add the week numbers back to the table:
  
    1. uncomment the above line that adds the single-space string to the weekdays array
    2. uncomment the lines in getPastDates that push the week number to the pastDates array
    3. uncomment the ternary in the render function where you map the first item in the week
       array to a special table header cell  
*/


// // TODO: Also temp, but I might reuse this name later on
// //  this should also be a prop
// const gameRecords = TEMP_GAME_RECORDS.map((record) => {
//   record.lastPlayed = convertFromFirestoreTimestampToDate(record.lastPlayed);
//   return record;
// });


const DailyStreakVisualization = ({
  gameRecords,
}) => {
  const [ gameRecordsByDay, setGameRecordsByDay ] = useState();
  const [ dailyMax, setDailyMax ] = useState();
  
  const largestKey = useRef(null);

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

  // TODO: Remove after finished with DailyStreakVisualization
  // used to test cell colors by generating a random dailyStreakCellNames className
  // const getRandomClassName = () => 
  //   dailyStreakCellNames[Math.floor(Math.random() * dailyStreakCellNames.length)];

  const getCellClassName = (cellDate) => {
    if (!cellDate || !dailyMax) {
      return;
    }

    console.log(`DSVisualization: getCellClassName: For ${cellDate}, we have ${getPuzzleCountOnDay(cellDate)}`);
    let classNameIndex = Math.floor((getPuzzleCountOnDay(cellDate) / dailyMax) * 10);
    const cellClassName = dailyStreakCellNames[classNameIndex];
    // console.log(`DSVisualization: getCellClassName: classNameIndex is ${classNameIndex}`);
    // console.log(`DSVisualization: getCellClassName: className is ${cellClassName}`);
    
    return cellClassName;
  };

  // helper function to get puzzle count on a given day
  const getPuzzleCountOnDay = (cellDate) => {
    if (!cellDate || !gameRecordsByDay || !gameRecordsByDay[cellDate] || !Array.isArray(gameRecordsByDay[cellDate])) {
      return 0;
    }

    return gameRecordsByDay[cellDate].length;
  };

  // TODO: Maybe move to its own module in utils?
  const getPastDates = (
    // 84 is past 12 weeks
    // initialDayDelta = 84,
    // 77 is 11 weeks, which we'll use plus currentDate.getDay for the week in progress 
    initialDayDelta = 77
  ) => {
    const currentDate = new Date();
    // console.log("DailyStreakVisualization: getPastDates: currentDate is:", currentDate);
    // console.log("DailyStreakVisualization: getPastDates: currentDate.getDay():", currentDate.getDay());
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
        // this line adds the week number, in tandem with a one-space string prepended to 
        //  the weekdays array
        // pastDates[currentWeek].push(currentWeek);
      }

      const millisOffset = i * 24 * 60 * 60 * 1000;
      const date = new Date(currentDate.getTime() - millisOffset);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      //TODO: If we want to show dates as day/month (global style), we'd do it here
      pastDates[currentWeek].push(`${month}/${day}`);

      currentWeekday++;
    }

    // console.log("DailyStreakVisualization: getPastDates: result is:", pastDates);
    return pastDates;
  }

  const cellWeeks = getPastDates();

  useEffect(() => {
    if (!gameRecords) {
      return;
    }

    console.log("DSVisualization: useEffect: Received gameRecords as prop:", gameRecords);

    const newGameRecordsByDay = {};

    // format gameRecords into gameRecordsByDay
    gameRecords.forEach((record) => {
      if (!record.completed) {
        return;
      }
    
      const { lastPlayed } = record;
      const month = lastPlayed.getMonth() + 1;
      const day = lastPlayed.getDate();
      const dayKey = `${month}/${day}`;
    
      if (newGameRecordsByDay[dayKey]) {
        newGameRecordsByDay[dayKey].push(record);
      }
      else {
        newGameRecordsByDay[dayKey] = [record];
      }
    });

    // find the largestKey and the dailyMax (most puzzles in one day)
    
    // TODO: Recalculated on memo?
    largestKey.current = findKeyWithLargestArray(newGameRecordsByDay);
    const newDailyMax = newGameRecordsByDay[largestKey.current].length;
    
    console.log("DSVisualization: useEffect: gameRecords:", gameRecords);
    console.log("DSVisualization: useEffect: newGameRecordsByDay:", newGameRecordsByDay);
    console.log("DSVisualization: useEffect: largestKey:", largestKey.current);
    console.log("DSVisualization: useEffect: newDailyMax:", newDailyMax);

    setDailyMax(newDailyMax);
    setGameRecordsByDay(newGameRecordsByDay);
  }, []);

  return (
    <div className="daily-streak-container">
      {
        !gameRecordsByDay ? (
          // TODO: Create better loading component
          (<p>Loading...</p>)
        ) : (
          <>
            {/* Weeks header */}

            <div className="daily-streak-week week-header">
              {
                weekdays.map((weekDay, index) => (
                  <div className="daily-streak-cell-info" key={index}>{weekDay}</div>
                ))
              }
            </div>

            {
              cellWeeks.map((week, index) => (
                <div 
                  className="daily-streak-week"
                  key={index}
                >
                  {
                    week.map((cellDate, index) => (
                      // this commented code adds the week numbers back
                      // index === 0 ? (
                      //   <div className="daily-streak-cell-info" key={index}>{cellDate + 1}</div>
                      // ) : (
                        <div 
                          className={`daily-streak-cell ${getCellClassName(cellDate)}`} 
                          key={index}
                        >
                          <div className="daily-streak-cell-date">
                            {cellDate}
                          </div>

                          <div className="daily-streak-cell-value">
                            {getPuzzleCountOnDay(cellDate)}
                          </div>
                            
                        </div> 
                      // )
                    ))
                  }
                </div>
              ))
            }
          </>
        )
      }
    </div>
  );
}
 
export default DailyStreakVisualization;