import React, {
  useEffect,
  useState,
} from 'react';

import "./AchievementContainer.scss";

import Achievement from '../Achievement/Achievement';

const AchievmentContainer = ({ 
  achievements,
  userAchievements,
}) => {
  const [ revealHidden, setRevealHidden ] = useState(false);
  const achievementIsUnlocked = (achievement) => 
    userAchievements.includes(achievement.id);

  // TODO: include some controls here to toggle hiding secret achievments

  const achievementList = achievements.map((achievement, index) => (
    <Achievement
      achievement={achievement}
      revealHidden={revealHidden}
      isUnlocked={achievementIsUnlocked(achievement)}
      key={`achievement-${index}`}
    />
  ));

  useEffect(() => {
    console.log("AchievementContainer: useEffect: userAchievements:", userAchievements);
  }, []);

  return ( 
    <div className="achievement-container">
      {achievementList}
    </div>
  );
}
 
export default AchievmentContainer;