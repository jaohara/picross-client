import React, {
  useContext,
  useEffect,
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
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';

import convertMillisToMinutesAndSeconds from '../../../utils/convertMillistoMinutesAndSeconds';

const ProfileMenu = () => {
  const {
    achievements,
  } = useContext(DataContext);

  const {
    logout,
    user,
    userProfile,
  } = useContext(UserContext);

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

  const achievementRecords = userProfile.gameRecords.achievements;
  const puzzleRecords = userProfile.gameRecords.puzzles;
  const puzzleRecordKeys = Object.keys(puzzleRecords);
  const userAchievements = Object.keys(achievementRecords);

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
  })

  useEffect(() => {
    console.log("ProfileMenu: userProfile is:", userProfile);
    console.log("ProfileMenu: achievementRecords is:", achievementRecords);
    console.log("ProfileMenu: userAchievements is:", userAchievements);
    console.log("")
  });

  const recordLineItems = statKeys.map((statKey, index) => (
    <ProfileRecordLineItem
      key={`profile-record-line-item-key-${index}`}
      recordName={statKey}
      recordValue={stats[statKey].value}
      isTime={stats[statKey].isTime}
    />
  ))

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

          <div className="profile-stats">
            <h1>Stats</h1>
            {/* TODO: Think of a better way to present this, probably not as a ul */}
            <ul>
              {recordLineItems}
              <li>Account Age?</li>
              <li>Longest Daily activity Streak?</li>
              <li>Longest Daily completion Streak?</li>
              <li>Daily completion visualized like a github commit chart?</li>
              <li>What else?</li>
            </ul>
          </div>

          <div className="profile-achievements">
            <h1>Achievements</h1>
          </div>

          <AchievementContainer
            achievements={achievements}
            userAchievements={userAchievements}
          />

          {/* TODO: Remove this garbage */}
          <div className="profile-todo" style={{display: "none"}}>
            <h1>Todo:</h1>
            <ul>
              <li>Show user statistics summary</li>
              <li>Show unlocked achievements</li>
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