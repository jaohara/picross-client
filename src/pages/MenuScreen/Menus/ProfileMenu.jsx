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

import Button from '../../../components/Button/Button';
import DailyStreakVisualization from '../../../components/DailyStreakVisualization/DailyStreakVisualization';
import MenuContent from '../../../components/MenuContent/MenuContent';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuSection from '../../../components/MenuSection/MenuSection';

import convertMillisToMinutesAndSeconds from '../../../utils/convertMillisToMinutesAndSeconds';
import convertFromFirestoreTimestampToDate from '../../../utils/convertFromFirestoreTimeStampToDate';

// TODO: Remove flag after new menu is implemented
// const OLD_IMPLEMENTATION = true;
const OLD_IMPLEMENTATION = false;

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

  const oldJsx = (
    <div className="profile-menu menu">
      <MenuHeader
        iconType="profile"
        title="User Profile"
      />
      <div className="menu-body-container">
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
          </div>
        </div>
      </div>
    </div>
  );

  return OLD_IMPLEMENTATION ? oldJsx : ( 
    <div className="profile-menu menu">
      <MenuSection>
        <ProfileOverview 
          userName={userProfile.name}
        />
      </MenuSection>

      <MenuSection>
        <MenuContent>
          <DailyStreakVisualization  
            gameRecords={gameRecords}
          />
        </MenuContent>
      </MenuSection>

      <MenuSection>
        {/* TODO: map game records into ProfileGameRecord */}
        <ProfileGameRecord></ProfileGameRecord>
      </MenuSection>
    </div>
  );
};

// TODO: Use the user data to populate this
const ProfileOverview = ({
  userName = "user name",
  stats,
}) => {
  return (
    <MenuContent 
      columns={2}
      opaque={false}
    >
      <MenuContent opaque={false}>
        <h1>{userName}</h1>
      </MenuContent>
      <MenuContent>
        <h1>Stats display</h1>
      </MenuContent>
    </MenuContent>
  )
}

// TODO: Have this pull info from completed gameRecords
const ProfileGameRecord = ({

}) => {
  return (
    <MenuContent columns={2}>
      <MenuContent>
        <h1>Puzzle Icon</h1>
      </MenuContent>
      <MenuContent>
        <h1>Puzzle Stats</h1>
        <ul>
          <li>Some Stat</li>
          <li>Another Stat</li>
          <li>More Stats</li>
        </ul>
      </MenuContent>
    </MenuContent>
  )
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