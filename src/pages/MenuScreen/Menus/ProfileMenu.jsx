import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Navigate } from 'react-router-dom';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { DataContext } from '../../../contexts/DataContext';
// import { GameContext } from '../../../contexts/GameContext';

import AchievementContainer from '../../../components/AchievementContainer/AchievementContainer';
import Button from '../../../components/Button/Button';
import DailyStreakVisualization from '../../../components/DailyStreakVisualization/DailyStreakVisualization';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';

import convertMillisToMinutesAndSeconds from '../../../utils/convertMillisToMinutesAndSeconds';
import convertFromFirestoreTimestampToDate from '../../../utils/convertFromFirestoreTimeStampToDate';

// TODO: REMOVE, TEMP DATA
const TEMP_GAME_RECORDS = [
  {
    completed: true,
    lastPlayed: { seconds: 1688462821, nanoseconds: 0 },
    gameTimer: 214500,
    testGameRecord: true,
    moves: 55,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1688384400, nanoseconds: 0 },
    gameTimer: 289000,
    testGameRecord: true,
    moves: 76,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1688380800, nanoseconds: 0 },
    gameTimer: 191000,
    testGameRecord: true,
    moves: 42,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1688377200, nanoseconds: 0 },
    gameTimer: 339000,
    testGameRecord: true,
    moves: 68,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1688313600, nanoseconds: 0 },
    gameTimer: 150000,
    testGameRecord: true,
    moves: 33,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1688197200, nanoseconds: 0 },
    gameTimer: 346000,
    testGameRecord: true,
    moves: 80,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1688190000, nanoseconds: 0 },
    gameTimer: 173000,
    testGameRecord: true,
    moves: 58,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1687981200, nanoseconds: 0 },
    gameTimer: 212000,
    testGameRecord: true,
    moves: 49,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1687472400, nanoseconds: 0 },
    gameTimer: 243000,
    testGameRecord: true,
    moves: 63,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1687081200, nanoseconds: 0 },
    gameTimer: 116000,
    testGameRecord: true,
    moves: 39,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686882000, nanoseconds: 0 },
    gameTimer: 304000,
    testGameRecord: true,
    moves: 72,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686878400, nanoseconds: 0 },
    gameTimer: 233000,
    testGameRecord: true,
    moves: 61,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686874800, nanoseconds: 0 },
    gameTimer: 398000,
    testGameRecord: true,
    moves: 82,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686871200, nanoseconds: 0 },
    gameTimer: 221000,
    testGameRecord: true,
    moves: 59,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686788400, nanoseconds: 0 },
    gameTimer: 278000,
    testGameRecord: true,
    moves: 77,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686692400, nanoseconds: 0 },
    gameTimer: 186000,
    testGameRecord: true,
    moves: 40,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686596400, nanoseconds: 0 },
    gameTimer: 317000,
    testGameRecord: true,
    moves: 70,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686500400, nanoseconds: 0 },
    gameTimer: 222000,
    testGameRecord: true,
    moves: 56,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1686010800, nanoseconds: 0 },
    gameTimer: 130000,
    testGameRecord: true,
    moves: 31,
  },
  {
    completed: true,
    lastPlayed: { seconds: 1684234800, nanoseconds: 0 },
    gameTimer: 139800,
    testGameRecord: true,
    moves: 38,
  },
];

// TODO: Also temp, but I might reuse this name later on
//  this should also be a prop
// const gameRecords = TEMP_GAME_RECORDS.map((record) => {
//   record.lastPlayed = convertFromFirestoreTimestampToDate(record.lastPlayed);
//   return record;
// });

const processGameRecords = (records) => records.map((record) => ({
  ...record,
  lastPlayed: convertFromFirestoreTimestampToDate(record.lastPlayed),
}));

const ProfileMenu = () => {
  const {
    completedGameRecords,
    logout,
    puzzleRecords,
    user,
    userProfile,
  } = useContext(UserContext);

  const gameRecords = useMemo(
    () => processGameRecords(completedGameRecords), [completedGameRecords]
  );

  if (!user || !userProfile) {
    return (<Navigate to="/login" />);
  }

  const prependedButtons = [
    (
      <Button
        iconType='logout'
        onClick={logout}
      >
        Logout
      </Button>
    ),
  ];

  const puzzleRecordKeys = Object.keys(puzzleRecords); 

  const stats = {
    "Completed Puzzles": {
      value: 0
    },
    "Fastest Puzzle Time": {
      isTime: true,
      value: null,
    },
    "Total Puzzle Time": {
      isTime: true,
      value: 0,
    },
  };

  const statKeys = Object.keys(stats);

  puzzleRecordKeys.forEach((puzzleRecordKey) => {
    const puzzle = puzzleRecords[puzzleRecordKey];

    // go through each puzzle
    if (puzzle.completed) {
      stats["Completed Puzzles"].value++;
    }

    if (!stats["Fastest Puzzle Time"].value || puzzle.gameTimer < stats["Fastest Puzzle Time"].value) {
      stats["Fastest Puzzle Time"].value = puzzle.gameTimer;
    }

    stats["Total Puzzle Time"].value += puzzle.gameTimer;
  });

  const recordLineItems = statKeys.map((statKey, index) => (
    <ProfileRecordLineItem
      key={`profile-record-line-item-key-${index}`}
      recordName={statKey}
      recordValue={stats[statKey].value}
      isTime={stats[statKey].isTime}
    />
  ));

  return ( 
    <div className="profile-menu menu">
      <MenuHeader
        iconType="profile"
        title="User Profile"
      />
      <div className="menu-body-container">
        <MenuLinks
          prependedButtons={prependedButtons} 
          excludeAll={true}
          showBackButton={true}
        />

        <div className="menu-body">
          <h1 className="profile-name">{userProfile.name}</h1>

          <div className="profile-stats profile-container">
            <h1>Stats</h1>
            {/* TODO: Think of a better way to present this, probably not as a ul */}
            <ul>
              {recordLineItems}
              <li>Account Age?</li>
            </ul>
          </div>

          <div className="profile-daily-streak profile-container">
            <h1>Daily Streak</h1>

            <DailyStreakVisualization
              gameRecords={gameRecords}
            />

            <p><strong>TODO:</strong> Add "Longest Unbroken Streak"</p>
          </div>

          {/* TODO: Remove this garbage */}
          <div className="profile-todo">
            <h1>Todo:</h1>
            <ul>
              <li>Make a better view (see sticky note on desk) for "stats"</li>
              <li>Use these icons: TbClockBolt for fastest, TbLink for longest chain (or not, has semantic meaning as link - maybe TbLine?), what else?</li>
              <li>Maybe allow a user to pick a puzzle as their avatar?</li>
              <li>This needs some sort of dynamic avatar/profile rank icon, as well as cool visualization for stats,</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileRecordLineItem = ({
  isTime,
  recordName,
  recordValue,
}) => {
  const getRecordValue = () => 
    isTime ? convertMillisToMinutesAndSeconds(recordValue) : recordValue;

  return (
    <li className='profile-record-line-item'>
      <span className="profile-record-name">
        {recordName}:
      </span>
      &nbsp;
      <span className="profile-record-value">
        {getRecordValue()}
      </span>
    </li>
  )
}
 
export default ProfileMenu;