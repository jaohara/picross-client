import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import "./DailyStreakVisualization.scss";

import { WEEKDAY_STRINGS } from '../../constants';

import convertFromFirestoreTimestampToDate from '../../utils/convertFromFirestoreTimeStampToDate';
import findKeyWithLargestArray from '../../utils/findKeyWithLargestArray';

const weekdays = [" ", ...WEEKDAY_STRINGS];

// // TODO: REMOVE, TEMP DATA
// const TEMP_GAME_RECORDS = [
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688462821, nanoseconds: 0 },
//     gameTimer: 214500,
//     testGameRecord: true,
//     moves: 55,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688384400, nanoseconds: 0 },
//     gameTimer: 289000,
//     testGameRecord: true,
//     moves: 76,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688380800, nanoseconds: 0 },
//     gameTimer: 191000,
//     testGameRecord: true,
//     moves: 42,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688377200, nanoseconds: 0 },
//     gameTimer: 339000,
//     testGameRecord: true,
//     moves: 68,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688313600, nanoseconds: 0 },
//     gameTimer: 150000,
//     testGameRecord: true,
//     moves: 33,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688197200, nanoseconds: 0 },
//     gameTimer: 346000,
//     testGameRecord: true,
//     moves: 80,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1688190000, nanoseconds: 0 },
//     gameTimer: 173000,
//     testGameRecord: true,
//     moves: 58,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1687981200, nanoseconds: 0 },
//     gameTimer: 212000,
//     testGameRecord: true,
//     moves: 49,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1687472400, nanoseconds: 0 },
//     gameTimer: 243000,
//     testGameRecord: true,
//     moves: 63,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1687081200, nanoseconds: 0 },
//     gameTimer: 116000,
//     testGameRecord: true,
//     moves: 39,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686882000, nanoseconds: 0 },
//     gameTimer: 304000,
//     testGameRecord: true,
//     moves: 72,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686878400, nanoseconds: 0 },
//     gameTimer: 233000,
//     testGameRecord: true,
//     moves: 61,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686874800, nanoseconds: 0 },
//     gameTimer: 398000,
//     testGameRecord: true,
//     moves: 82,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686871200, nanoseconds: 0 },
//     gameTimer: 221000,
//     testGameRecord: true,
//     moves: 59,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686788400, nanoseconds: 0 },
//     gameTimer: 278000,
//     testGameRecord: true,
//     moves: 77,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686692400, nanoseconds: 0 },
//     gameTimer: 186000,
//     testGameRecord: true,
//     moves: 40,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686596400, nanoseconds: 0 },
//     gameTimer: 317000,
//     testGameRecord: true,
//     moves: 70,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686500400, nanoseconds: 0 },
//     gameTimer: 222000,
//     testGameRecord: true,
//     moves: 56,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1686010800, nanoseconds: 0 },
//     gameTimer: 130000,
//     testGameRecord: true,
//     moves: 31,
//   },
//   {
//     completed: true,
//     lastPlayed: { seconds: 1684234800, nanoseconds: 0 },
//     gameTimer: 139800,
//     testGameRecord: true,
//     moves: 38,
//   },
// ];

// // TODO: Also temp, but I might reuse this name later on
// //  this should also be a prop
// const gameRecords = TEMP_GAME_RECORDS.map((record) => {
//   record.lastPlayed = convertFromFirestoreTimestampToDate(record.lastPlayed);
//   return record;
// });

// TODO: Move this logic - it should be within the body of the component 
// BEGIN LOGIC
// const gameRecordsByDay = {};


// END OF LOGIC TO MOVE INTO COMPONENT

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

  const getRandomClassName = () => 
    dailyStreakCellNames[Math.floor(Math.random() * dailyStreakCellNames.length)];

  const getCellClassName = (cellDate) => {
    if (!cellDate || !dailyMax) {
      return;
    }

    console.log(`DSV: getCellClassName: For ${cellDate}, we have ${getPuzzleCountOnDay(cellDate)}`);
    let classNameIndex = Math.floor((getPuzzleCountOnDay(cellDate) / dailyMax) * 10);
    const cellClassName = dailyStreakCellNames[classNameIndex];
    console.log(`DSV: getCellClassName: classNameIndex is ${classNameIndex}`);
    console.log(`DSV: getCellClassName: className is ${cellClassName}`);
    
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
        pastDates[currentWeek].push(currentWeek);
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

  useEffect(() => {
    if (!gameRecords) {
      return;
    }

    console.log("DSV: useEffect: Received gameRecords as prop:", gameRecords);

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
    
    console.log("DSV: useEffect: gameRecords:", gameRecords);
    console.log("DSV: useEffect: newGameRecordsByDay:", newGameRecordsByDay);
    console.log("DSV: useEffect: largestKey:", largestKey.current);
    console.log("DSV: useEffect: newDailyMax:", newDailyMax);

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
                      index === 0 ? (
                        <div className="daily-streak-cell-info" key={index}>{cellDate + 1}</div>
                      ) : (
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
                      )
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