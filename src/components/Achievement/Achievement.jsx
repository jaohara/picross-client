import React from 'react';

import {
  TbPuzzle,
  TbQuestionMark,
} from "react-icons/tb";

import "./Achievement.scss";

import {
  LARGE_ICON_SIZE,
  SECRET_ACHIEVEMENT_DESCRIPTION,
  SECRET_ACHIEVEMENT_NAME,
} from "../../constants";

const Achievement = ({ 
  achievement, 
  isUnlocked = false,
  revealHidden = false,
}) => {

  const hideSecretAchievement = achievement.secret && !revealHidden && !isUnlocked;

  const getAchievementPrettyName = () => hideSecretAchievement ? 
    SECRET_ACHIEVEMENT_NAME :
    achievement.prettyName;

  const getAchievementDescription = () => hideSecretAchievement ?
    SECRET_ACHIEVEMENT_DESCRIPTION :
    achievement.description;

  const getAchievmentWrapperClassNames = () => `
    achievement
    ${hideSecretAchievement ? "secret" : ""}
    ${!isUnlocked ? "locked" : "unlocked"}
  `;

  const getAchievementIcon = () => hideSecretAchievement ? 
    (<TbQuestionMark 
      size={LARGE_ICON_SIZE}
    />) :
    (<TbPuzzle 
      color={achievement.color} 
      size={LARGE_ICON_SIZE}
    />);

  return ( 
    <div className={getAchievmentWrapperClassNames()}>
      <div className="achievement-pretty-name">
        <h1>{getAchievementPrettyName()}</h1>
      </div>

      <div className="achievement-body">
        <div className="achievement-icon-wrapper">
          <p>{getAchievementIcon()}</p>
        </div>

        <div className="achievement-description">
          {getAchievementDescription()}
        </div>
      </div>
    </div>
  );
}
 
export default Achievement;
