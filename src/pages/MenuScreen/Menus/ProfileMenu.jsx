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
import MenuContentGroup from '../../../components/MenuContentGroup/MenuContentGroup';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuSection from '../../../components/MenuSection/MenuSection';

import convertMillisToMinutesAndSeconds from '../../../utils/convertMillisToMinutesAndSeconds';
import convertFromFirestoreTimestampToDate from '../../../utils/convertFromFirestoreTimeStampToDate';

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
      icon: "puzzle",
      value: 0,
    },
    "Fastest Puzzle Time": {
      icon: "fastest",
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
      <MenuSection 
        noPaddingBottom
        transparent
      >
        <ProfileOverview 
          stats={stats}
          userName={userProfile.name}
        />
      </MenuSection>

      <MenuSection 
        noPadding
        transparent
      >
        <MenuContent>
          <MenuHeader
            title={"Daily Streak"}
          />
          <DailyStreakVisualization  
            gameRecords={gameRecords}
          />
        </MenuContent>
      </MenuSection>

      <MenuSection 
        noPaddingTop
        transparent
      >
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
  const statKeys = Object.keys(stats);

  return (
    <MenuContent 
      // columns={2}
      // firstChildSize={"200px"}
    >
      <MenuHeader
        title={"User Profile"}
      />
      <MenuContentGroup
        columns={2}
        firstChildSize={"200px"}
      >
        <MenuContent centered noPadding>
          <h1>{userName}</h1>
        </MenuContent>
        <MenuContent 
          columns={3} 
          noPadding 
          opaque={false}
        >
          {
            statKeys.map((statKey) => (
              <MenuContent centered>
                <p>
                  {stats[statKey].value}
                </p>
                <h4>{statKey}</h4>
              </MenuContent>
            ))
          }
        </MenuContent>
      </MenuContentGroup>
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